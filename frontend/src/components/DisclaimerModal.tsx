import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  AlertTitle,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ open, onAccept }) => {
  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'warning.main',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.dark' }}>
              Legal Disclaimer & Terms of Use
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please read carefully before proceeding
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            Proof of Concept - Not Officially Supported
          </AlertTitle>
          This tool is a proof of concept demonstration and is NOT officially supported by Okta.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Important Notices:
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1.5 } }}>
            <Typography component="li" variant="body2">
              <strong>No Warranty:</strong> This tool is provided "as-is" without any warranties or guarantees of any kind, express or implied.
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Production Use:</strong> Before using in a production environment, this codebase MUST be thoroughly reviewed and tested by your organization's security and engineering teams.
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Infrastructure Changes:</strong> This tool makes automated changes to your Okta organization including creating realms, groups, resource sets, and role assignments.
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Security Review Required:</strong> Your organization should conduct a security audit and penetration testing before production deployment.
            </Typography>
            <Typography component="li" variant="body2">
              <strong>No Support:</strong> Okta does not provide official support for this tool. Use at your own risk.
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Compliance:</strong> Ensure compliance with your organization's security policies and procedures before use.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            By clicking "I Accept", you acknowledge that:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • You understand this is an unsupported proof of concept tool<br />
            • You accept full responsibility for any changes made to your Okta organization<br />
            • You will conduct appropriate security reviews before production use<br />
            • You understand Okta provides no warranty or support for this tool
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          onClick={onAccept}
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
            }
          }}
        >
          I Accept - Proceed to Application
        </Button>
      </DialogActions>
    </Dialog>
  );
};
