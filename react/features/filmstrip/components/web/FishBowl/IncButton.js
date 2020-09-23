import React from 'react';


export const IncButton = ({ className, ...props }) => (<button
    className = { `inc-button ${className}` }
    { ...props } />);
