'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { CircularProgress, Typography, Container, Box } from "@mui/material";

const ResultPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session_id = searchParams.get('session_id');

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCheckoutSession = async () => {
            if (!session_id) return;

            try {
                const res = await fetch(`/api/checkout_session?session_id=${session_id}`);
                const sessionData = await res.json();
                if (res.ok) {
                    setSession(sessionData);
                } else {
                    setError(sessionData.error || "An error occurred");
                }
            } catch (err) {
                setError("An error occurred while fetching the session");
            } finally {
                setLoading(false);
            }
        };

        fetchCheckoutSession();
    }, [session_id]);

    if (loading) {
        return (
            <Container
                maxWidth="xs"
                sx={{
                    textAlign: 'center',
                    mt: 4,
                }}
            >
                <CircularProgress />
                <Typography variant="h6">Loading Purchase...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                maxWidth="xs"
                sx={{
                    textAlign: 'center',
                    mt: 4,
                }}
            >
                <Typography variant="h6" color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container
            maxWidth="xs"
            sx={{
                textAlign: 'center',
                mt: 4,
            }}
        >
            {session.payment_status === 'paid' ? (
                <>
                    <Typography variant="h4">Thank you for your purchase!</Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Session ID: {session_id}</Typography>
                        <Typography variant="body1">
                            We have received your payment. You will receive an order confirmation email shortly.
                        </Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="h4" color="error">Payment Failed</Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Session ID: {session_id}</Typography>
                        <Typography variant="body1">
                            We haven't received your payment. Please try again or contact support if the issue persists.
                        </Typography>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default ResultPage;
