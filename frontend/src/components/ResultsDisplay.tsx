import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { UploadResponse } from '../types/index';

interface ResultsDisplayProps {
  results: UploadResponse;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { summary } = results;

  return (
    <Box sx={{ width: '100%', mx: 'auto', mt: 6 }}>
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
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 3,
            textAlign: 'center'
          }}
        >
          Processing Results
        </Typography>

        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            For each organization, the system created:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <li><strong>Realm</strong> with automatic user assignment</li>
            <li><strong>Admin Group</strong> (assigned to Partner Portal app)</li>
            <li><strong>User Group</strong> for realm members</li>
            <li><strong>Resource Set</strong> for scoped administration</li>
          </Box>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              bgcolor: 'white'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
              {summary.total}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Total Organizations
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid #d4edda',
              bgcolor: '#f0fdf4'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#16a34a', mb: 1 }}>
              {summary.successful}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Successfully Created
            </Typography>
          </Paper>
          {summary.failed > 0 && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px solid #f8d7da',
                bgcolor: '#fef2f2'
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#dc2626', mb: 1 }}>
                {summary.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Failed
              </Typography>
            </Paper>
          )}
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Organization</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.results.map((result, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': { bgcolor: '#f8f9fa' },
                    '&:last-child td': { border: 0 }
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {result.organization}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {result.success ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Success"
                        sx={{
                          bgcolor: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #d4edda',
                          fontWeight: 600
                        }}
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon />}
                        label="Failed"
                        sx={{
                          bgcolor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #f8d7da',
                          fontWeight: 600
                        }}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {result.success && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {result.realmId && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Realm:</strong>{' '}
                            <Box
                              component="span"
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: '#f8f9fa',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              {result.realmId}
                            </Box>
                          </Typography>
                        )}
                        {result.adminGroupId && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Admin Group:</strong>{' '}
                            <Box
                              component="span"
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: '#f0fdf4',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              {result.adminGroupId}
                            </Box>
                          </Typography>
                        )}
                        {result.userGroupId && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>User Group:</strong>{' '}
                            <Box
                              component="span"
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: '#eff6ff',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              {result.userGroupId}
                            </Box>
                          </Typography>
                        )}
                        {result.resourceSetId && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Resource Set:</strong>{' '}
                            <Box
                              component="span"
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: '#fef3c7',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              {result.resourceSetId}
                            </Box>
                          </Typography>
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {result.error && (
                      <Typography variant="body2" sx={{ color: '#dc2626' }}>
                        {result.error}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
