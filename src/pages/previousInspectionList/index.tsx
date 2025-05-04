import React, { useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    styled,
    IconButton
} from '@mui/material';
import FormPageWrapper from '../../components/formPageWrapper';
import { useSelector } from 'react-redux';
import { getPreviousInspectionList } from '../../store/Inspection/selectors';
import { useDispatch } from 'react-redux';
import * as actions from "../../store/Inspection/actions";
import { PayloadAction } from '@reduxjs/toolkit';
import { InspectionEntity } from 'entities/inspection';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import { FormatDateOnly } from '../../helper/util';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: '0.875rem',
}));

const StyledTableHeaderCell = styled(StyledTableCell)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    fontWeight: 500,
}));

const PreviousInspectionListPage: React.FC = () => {
    const dispatch = useDispatch();
    const { goTo } = useNavigationManager();
    const previousInspects: InspectionEntity[] = useSelector(getPreviousInspectionList);

    useEffect(() => {
        dispatch({
            type: actions.GET_LIST_INSPECTIONS_DATA,
        } as PayloadAction)
    }, [dispatch])

    const handleRowClick = (row: InspectionEntity) => {
        dispatch({
            type: actions.GET_PREVIOUS_INSPECTION_DATA,
            payload: row.id,
        } as PayloadAction<string>);

        goTo(RoutesValueEnum.PreviousInspectionDetail);
    }

    return (
        <FormPageWrapper isFooterVisible={false}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Inspector Name</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Engineer Name</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Inspection Completed</StyledTableHeaderCell>
                            <StyledTableHeaderCell></StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {previousInspects?.map((row, index) => (
                            <TableRow key={index}>
                                <StyledTableCell>{row.inspectorName}</StyledTableCell>
                                <StyledTableCell>{row.engineerName}</StyledTableCell>
                                <StyledTableCell>{FormatDateOnly(row.inspectionDate)}</StyledTableCell>
                                <StyledTableCell>
                                    <IconButton onClick={() => handleRowClick(row)}>
                                        <ArrowForwardIosIcon />
                                    </IconButton>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </FormPageWrapper>
    )
}

export default PreviousInspectionListPage;
