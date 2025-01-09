import React from 'react';
import { Button, List, ListItem, ListItemText, IconButton, styled, Box, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteImagePayload, MaintenanceImageFile } from '../../models/inspectionModel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSelector } from 'react-redux';
import { getIsUploadingFlag } from '../../store/MaintenanceAction/selectors';
import { green } from '@mui/material/colors';
import { useDispatch } from 'react-redux';
import { PayloadAction } from '@reduxjs/toolkit';
import * as actions from "../../store/MaintenanceAction/actions";

interface ImageUploadProps {
    handleImageUpload: (photos: MaintenanceImageFile[]) => void;
    images: MaintenanceImageFile[];
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ImageUpload: React.FC<ImageUploadProps> = ({
    handleImageUpload,
    images
}) => {
    const dispatch = useDispatch();

    const uploadFlag = useSelector(getIsUploadingFlag);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const fileArray = Array.from(event.target.files).map(file => ({
                file,
                fileName: file.name,
                url: URL.createObjectURL(file)
            } as MaintenanceImageFile
            ));
            const newList = [...(images || []), ...fileArray];

            handleImageUpload(newList);
        }
        // Optionally, clear the selection
        event.target.value = '';
    };

    const handleDelete = (item: MaintenanceImageFile) => {
        const filterdList = images?.filter(image => image.url !== item.url);

        dispatch({
            type: actions.DELETE_MAINTENANCE_IMAGE,
            payload: {
                id: item.uploadAPIResponse?.id,
                updatedImageList: filterdList
            }
        } as PayloadAction<DeleteImagePayload>)

        URL.revokeObjectURL(item.url);
    };

    return (
        <div>
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                disabled={uploadFlag}
            >
                Upload Image
                <VisuallyHiddenInput
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*"
                />
            </Button>
            <Box sx={{ m: 1, position: 'relative' }}>
                <List>
                    {images?.map((image, index) => (
                        <ListItem key={index}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(image)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <img src={image.url} alt={`uploaded-img-${index}`} style={{ width: '100px', marginRight: '10px' }} />
                            <ListItemText primary={image.fileName} />
                        </ListItem>
                    ))}
                </List>
                {uploadFlag && (
                    <CircularProgress
                        size={24}
                        sx={{
                            color: green[500],
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
            </Box>
        </div>
    );
};

export default ImageUpload;
