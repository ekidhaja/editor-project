import React from "react";

class ErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.log({ error, errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return <div>There was an error somewhere</div>
        }
        
        return this.props.children;
    }  
}

export default ErrorBoundary;
