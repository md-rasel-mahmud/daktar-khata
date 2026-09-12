import React, { ErrorInfo, ReactNode } from "react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReturnHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Oops, something went wrong!</CardTitle>
              <CardDescription>
                We're sorry, but an unexpected error occurred while loading this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-gray-100 p-4 text-sm text-gray-600 overflow-auto max-h-48">
                {this.state.error?.message || "Unknown Error"}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4">
              <Button variant="outline" onClick={this.handleReturnHome}>
                Return Home
              </Button>
              <Button onClick={this.handleReload}>
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
