
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBackendApi } from '@/hooks/useBackendApi';
import { useToast } from '@/hooks/use-toast';

const BackendApiExample = () => {
  const { get, post, isAuthenticated, accessToken } = useBackendApi();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const testGetRequest = async () => {
    setLoading(true);
    try {
      const result = await get('/api/user/profile');
      
      if (result.error) {
        toast({
          title: "API Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "GET request completed successfully",
        });
        setResponse(result.data);
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to make API request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testPostRequest = async () => {
    setLoading(true);
    try {
      const result = await post('/api/user/update', {
        name: 'Test User',
        preferences: { theme: 'dark' }
      });
      
      if (result.error) {
        toast({
          title: "API Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "POST request completed successfully",
        });
        setResponse(result.data);
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to make API request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Backend API Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Authentication Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
          {accessToken && (
            <div className="bg-gray-100 p-2 rounded text-xs">
              <strong>Access Token (first 50 chars):</strong> {accessToken.substring(0, 50)}...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testGetRequest} 
            disabled={loading || !isAuthenticated}
            variant="outline"
          >
            Test GET Request
          </Button>
          <Button 
            onClick={testPostRequest} 
            disabled={loading || !isAuthenticated}
            variant="outline"
          >
            Test POST Request
          </Button>
        </div>

        {response && (
          <div className="bg-gray-100 p-4 rounded">
            <strong>API Response:</strong>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-yellow-600 text-sm">
            Please sign in to test the API functionality.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendApiExample;
