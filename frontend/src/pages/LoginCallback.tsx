import React from 'react';
import { LoginCallback as OktaLoginCallback } from '@okta/okta-react';
import { CircularProgress, Box, Typography } from '@mui/material';

export const LoginCallback: React.FC = () => {
  return (
    <OktaLoginCallback
      loadingElement={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6">Signing you in...</Typography>
        </Box>
      }
    />
  );
};
