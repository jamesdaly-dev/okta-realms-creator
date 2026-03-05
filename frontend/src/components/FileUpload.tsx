import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useOktaAuth } from '@okta/okta-react';
import { apiService } from '../services/apiService';
import type { UploadResponse } from '../types/index';

interface FileUploadProps {
  onUploadComplete: (response: UploadResponse) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const { authState } = useOktaAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = `name,domain,description
Acme Corporation,acme.com,Leading provider of innovative solutions
Widget Industries,widget.io,Global widget manufacturer
TechStart Inc,techstart.net,Technology startup accelerator`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'partner-organizations-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a CSV file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !authState?.accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.uploadCSV(file, authState.accessToken.accessToken);
      onUploadComplete(response);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload and process CSV');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CloudUploadIcon sx={{ fontSize: 64, color: '#667eea', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Upload Partner Organizations
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file to automatically create realms and assignment rules in Okta.
            Required columns: <strong>name</strong>, <strong>domain</strong>
          </Typography>
          <Button
            variant="text"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            sx={{
              color: '#667eea',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.05)',
              }
            }}
          >
            Don't have a CSV? Download our template
          </Button>
        </Box>

        <Box
          sx={{
            mb: 3,
            p: 4,
            border: '2px dashed',
            borderColor: file ? '#667eea' : '#cbd5e0',
            borderRadius: 2,
            bgcolor: file ? 'rgba(102, 126, 234, 0.05)' : 'white',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#667eea',
              bgcolor: 'rgba(102, 126, 234, 0.05)',
            }
          }}
        >
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'block' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#667eea', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {file ? file.name : 'Click to choose CSV file'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {file ? 'Click to choose a different file' : 'or drag and drop your file here'}
              </Typography>
            </Box>
          </label>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
          fullWidth
          size="large"
          sx={{
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
              boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
            },
            '&:disabled': {
              background: '#e2e8f0',
              boxShadow: 'none',
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
              Processing Organizations...
            </>
          ) : (
            'Upload and Create Realms'
          )}
        </Button>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              CSV Format Example:
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#5568d3',
                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                }
              }}
            >
              Download Template
            </Button>
          </Box>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e2e8f0'
            }}
          >
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', m: 0 }}>
              name,domain,description{'\n'}
              Acme Corp,acme.com,Acme Corporation{'\n'}
              Widget Inc,widget.io,Widget Industries
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};
