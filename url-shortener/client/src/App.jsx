import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Alert,
  Box,
  Stack,
  Card,
  CardContent,
} from '@mui/material';

const API_BASE = 'http://localhost:5000'; // adjust if your backend host/port differs

export default function App() {
  const [longUrl, setLongUrl] = useState('');
  const [validity, setValidity] = useState('30'); // minutes
  const [customCode, setCustomCode] = useState('');
  const [shortUrls, setShortUrls] = useState([]);
  const [error, setError] = useState('');

  const shorten = async () => {
    setError('');
    if (!longUrl.trim()) {
      setError('Please enter a valid URL.');
      return;
    }
    if (shortUrls.length >= 5) {
      setError('Maximum of 5 shortened URLs allowed in this session.');
      return;
    }

    try {
      const payload = {
        longUrl: longUrl.trim(),
        validity: parseInt(validity, 10) || undefined,
        customCode: customCode.trim() || undefined,
      };
      const res = await axios.post(`${API_BASE}/shorten`, payload);
      setShortUrls(prev => [...prev, { short: res.data.shortUrl, original: longUrl }]);
      setLongUrl('');
      setCustomCode('');
      setValidity('30');
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to shorten URL.';
      setError(msg);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        URL Shortener
      </Typography>

      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Long URL"
          fullWidth
          value={longUrl}
          onChange={e => setLongUrl(e.target.value)}
          placeholder="https://example.com/very/long/link"
        />
        <TextField
          label="Custom Code (optional)"
          fullWidth
          value={customCode}
          onChange={e => setCustomCode(e.target.value)}
          placeholder="e.g., myalias"
        />
        <TextField
          label="Validity in minutes"
          type="number"
          fullWidth
          value={validity}
          onChange={e => setValidity(e.target.value)}
        />
        <Button variant="contained" size="large" onClick={shorten}>
          Shorten URL
        </Button>

        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Shortened URLs ({shortUrls.length}/5)
          </Typography>
          {shortUrls.length === 0 && (
            <Typography variant="body2">No URLs shortened yet.</Typography>
          )}
          <List>
            {shortUrls.map((u, idx) => (
              <ListItem key={idx} disablePadding>
                <Card sx={{ width: '100%', mb: 1, borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Original:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {u.original}
                    </Typography>
                    <Typography variant="subtitle2" mt={1}>
                      Short URL:
                    </Typography>
                    <Typography variant="body1">
                      <a href={u.short} target="_blank" rel="noopener noreferrer">
                        {u.short}
                      </a>
                    </Typography>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        </Box>
      </Stack>
    </Container>
  );
}


