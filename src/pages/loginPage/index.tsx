// src/pages/loginPage/index.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Person as PersonIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from '../../enums';
import { useSelector } from 'react-redux';
import { getToken } from '../../store/Auth/selectors';

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
    height: '90vh',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3,
    }
}));

const LoginCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[8],
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxWidth: 400,
    width: '100%',
    position: 'relative',
    zIndex: 1,
    maxHeight: '80vh',
    overflow: 'auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius * 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(1.5),
    fontSize: '1.1rem',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: theme.shadows[3],
    '&:hover': {
        boxShadow: theme.shadows[6],
        transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease-in-out',
}));

const BrandSection = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(3),
    left: theme.spacing(3),
    color: 'white',
    zIndex: 2,
    [theme.breakpoints.down('sm')]: {
        position: 'relative',
        top: 'auto',
        left: 'auto',
        textAlign: 'center',
        marginBottom: theme.spacing(2),
    }
}));

const FooterSection = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(3),
    left: theme.spacing(3),
    right: theme.spacing(3),
    color: 'white',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    [theme.breakpoints.down('sm')]: {
        position: 'relative',
        bottom: 'auto',
        left: 'auto',
        right: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(1),
        marginTop: theme.spacing(2),
    }
}));

const DecorativePattern = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(1),
    left: theme.spacing(1),
    width: 100,
    height: 60,
    backgroundImage: 'url("/images/decorative-pattern.png")', // You can change this path
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    opacity: 0.8,
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    }
}));

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    const { login } = useAuth();
    const { goTo } = useNavigationManager();
    const token = useSelector(getToken);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Only check for authentication once on component mount
    useEffect(() => {
        if (!hasCheckedAuth) {
            if (token) {
                goTo(RoutesValueEnum.Home);
            }
            setHasCheckedAuth(true);
        }
    }, [token, goTo, hasCheckedAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both username and password');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await login(email, password);
            // Manually navigate on successful login
            goTo(RoutesValueEnum.Home);
        } catch (err) {
            setError('Login failed. Please check your credentials and try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <LoginContainer>
            {/* Brand Section */}
            {/* <BrandSection>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                    TRANSPORT
                </Typography>
            </BrandSection> */}

            {/* Decorative Pattern */}
            {/* <DecorativePattern /> */}

            {/* Login Card */}
            <LoginCard>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            mb: 1
                        }}
                    >
                        InspectInfra
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Infrastructure Inspection Management System
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <StyledTextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <StyledTextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <StyledButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={isLoading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </StyledButton>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                        Version number: 1.0.1
                    </Typography>
                </Box>
            </LoginCard>

            {/* Footer Section */}
            <FooterSection>
                <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        © 2025 All rights reserved.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        component="img"
                        src="/images/nsw-logo.png"
                        alt="NSW Government"
                        sx={{
                            height: 40,
                            width: 'auto',
                            opacity: 0.9,
                        }}
                    />
                </Box>
            </FooterSection>
        </LoginContainer>
    );
};

export default LoginPage;