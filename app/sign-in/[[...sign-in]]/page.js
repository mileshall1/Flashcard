import { AppBar, Container, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import SignIn from '../../components/SignIn';

export default function SignInPage() {
    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <AppBar position="static" sx={{ backgroundColor: "#3f51b5" }}>
                <Toolbar>
                    <Typography 
                        variant="h6" 
                        sx={{ flexGrow: 1, fontFamily: 'Inter, sans-serif' }} // Custom font
                    >
                        Flashcard Generator
                    </Typography>
                    <Link href="/sign-in" passHref>
                        <Button 
                            sx={{ 
                                color: 'white', 
                                backgroundColor: '#ff4081', 
                                '&:hover': { backgroundColor: '#ff79b0' }, 
                                fontFamily: 'Inter, sans-serif', 
                                ml: 1, // Margin-left
                                px: 2, // Padding-X
                            }}
                        >
                            Login
                        </Button>
                    </Link>
                    <Link href="/sign-up" passHref>
                        <Button 
                            sx={{ 
                                color: '#ffffff', 
                                backgroundColor: '#2196f3', 
                                '&:hover': { backgroundColor: '#64b5f6' },
                                fontFamily: 'Lato, sans-serif', 
                                ml: 1, // Margin-left
                                px: 2, // Padding-X
                            }}
                        >
                            Sign Up
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ mt: 4 }}
            >
                <Typography 
                    variant="h4" 
                    sx={{ mb: 4, fontFamily: 'Inter, sans-serif' }} // Custom font for the title
                >
                    Sign In
                </Typography>
                <SignIn />
            </Box>
        </Container>
    );
}
