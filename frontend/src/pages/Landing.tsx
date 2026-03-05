import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GitHubIcon from '@mui/icons-material/GitHub';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2,
          px: 4,
        }}
      >
        <Box sx={{ maxWidth: '864px', mx: 'auto', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CloudUploadIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Okta SPA One-Click Setup
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleGetStarted}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box sx={{ maxWidth: '864px', mx: 'auto', px: 3, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
            }}
          >
            Deploy Okta Secure Partner Access with one click
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Bulk provisioning of realms, realm assignment rules, groups, resource sets, and role assignments from a CSV.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.2rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
                boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
              }
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Disclaimer */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '2px solid',
            borderColor: 'warning.main',
            borderRadius: 3,
            bgcolor: '#fff9e6',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'warning.dark' }}>
            ⚠️ Proof of Concept - Not Okta Supported
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This tool is a proof of concept demonstration and is not officially supported by Okta.
            Before using this application in a production environment, the codebase should be thoroughly
            reviewed and tested by your organization's security and engineering teams.
          </Typography>
        </Paper>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
          bgcolor: 'white',
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
  );
};
