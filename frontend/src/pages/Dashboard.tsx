import React, { useState } from 'react';
import { Container, AppBar, Toolbar, Typography, Button, Box, Avatar, Chip, Alert, AlertTitle, Paper } from '@mui/material';
import { useOktaAuth } from '@okta/okta-react';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningIcon from '@mui/icons-material/Warning';
import GitHubIcon from '@mui/icons-material/GitHub';
import { FileUpload } from '../components/FileUpload';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { DisclaimerModal } from '../components/DisclaimerModal';
import type { UploadResponse } from '../types/index';

export const Dashboard: React.FC = () => {
  const { oktaAuth, authState } = useOktaAuth();
  const [uploadResults, setUploadResults] = useState<UploadResponse | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);

  // Check if disclaimer has been accepted in this session
  React.useEffect(() => {
    const accepted = sessionStorage.getItem('disclaimerAccepted');
    if (accepted === 'true') {
      setDisclaimerAccepted(true);
    } else {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('disclaimerAccepted', 'true');
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleLogout = async () => {
    await oktaAuth.signOut();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <DisclaimerModal open={showDisclaimer} onAccept={handleAcceptDisclaimer} />

      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <CloudUploadIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Okta SPA One-Click Setup
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<GitHubIcon />}
            href="https://github.com/jamesdaly-dev/okta-realms-creator"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            GitHub
          </Button>
          {authState?.isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                avatar={<Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  {authState.idToken?.claims.email?.toString().charAt(0).toUpperCase()}
                </Avatar>}
                label={authState.idToken?.claims.email}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 500,
                }}
              />
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }, py: 6, maxWidth: '1296px', mx: 'auto' }}>
        <Alert
          severity="warning"
          icon={<WarningIcon fontSize="large" />}
          sx={{
            mb: 4,
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'warning.main',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Proof of Concept - Not Okta Supported
          </AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>This tool is a proof of concept demonstration</strong> and is <strong>not officially supported by Okta</strong>.
          </Typography>
          <Typography variant="body2">
            Before using this application in a production environment, the codebase should be thoroughly reviewed and tested by your organization's security and engineering teams.
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Deploy Okta Secure Partner Access with one click
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Upload a CSV file to automatically provision components
          </Typography>
        </Box>

        {disclaimerAccepted ? (
          <>
            <FileUpload onUploadComplete={setUploadResults} />

            {uploadResults && <ResultsDisplay results={uploadResults} />}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Please accept the disclaimer to continue
            </Typography>
          </Box>
        )}

        {/* What happens behind the scenes */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'left',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#f8f9fa',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#667eea' }}>
              What happens when you upload:
            </Typography>
            <Box component="ol" sx={{ pl: 3, m: 0, '& li': { mb: 1.5 } }}>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Realm Creation:</strong> Creates a dedicated realm for each partner organization with automatic user assignment based on email domain
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Group Setup:</strong> Creates admin and user groups ({'{'}OrgName{'}'}‑Admins, {'{'}OrgName{'}'}‑Users) for role-based access control
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Resource Set:</strong> Configures a scoped resource set ({'{'}OrgName{'}'} Partner Realm) containing the realm, groups, and users
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Role Assignment:</strong> Assigns Partner Admin role to the admin group with delegated permissions scoped to their realm only
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Portal Access:</strong> Grants admin group access to the Partner Portal application for self-service management
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Box
          sx={{
            mt: 8,
            pt: 4,
            pb: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Built by <strong>James Daly</strong> with the assistance of{' '}
            <strong>
              <a
                href="https://claude.ai/code"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#667eea', textDecoration: 'none' }}
              >
                Claude Code
              </a>
            </strong>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
