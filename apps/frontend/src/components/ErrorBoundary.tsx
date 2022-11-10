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
            console.log("error occured somewhere in the universe");
        }
        return this.props.children;
    }  
}

export default ErrorBoundary;
