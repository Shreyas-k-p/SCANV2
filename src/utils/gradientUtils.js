/**
 * Safely extracts color values from CSS gradient strings
 * @param {string} gradient - CSS gradient string (e.g., "linear-gradient(135deg, #e94560 0%, #ff5c7a 100%)")
 * @returns {string} - First color value from the gradient, or fallback color
 */
export function extractGradientColor(gradient) {
    if (!gradient || typeof gradient !== 'string') {
        return 'rgba(233, 69, 96, 0.3)'; // Default fallback color
    }

    try {
        // Match color values in gradient (hex, rgb, rgba, or named colors)
        // Pattern: matches #hex, rgb(...), rgba(...), or color names
        const colorMatch = gradient.match(/(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|[a-zA-Z]+)/);
        
        if (colorMatch && colorMatch[1]) {
            return colorMatch[1];
        }
        
        // Fallback: try to extract from parentheses
        const parenMatch = gradient.match(/\(([^)]+)\)/);
        if (parenMatch && parenMatch[1]) {
            // Extract first color from the content
            const firstColor = parenMatch[1].split(',')[0].trim();
            // Remove percentage if present
            return firstColor.replace(/\s+\d+%/, '').trim();
        }
    } catch (error) {
        console.warn('Error extracting gradient color:', error);
    }
    
    // Default fallback
    return 'rgba(233, 69, 96, 0.3)';
}

/**
 * Safely extracts the color content between parentheses in a gradient
 * @param {string} gradient - CSS gradient string
 * @returns {string} - Color content between parentheses
 */
export function extractGradientContent(gradient) {
    if (!gradient || typeof gradient !== 'string') {
        return '#e94560 0%, #ff5c7a 100%';
    }

    try {
        const match = gradient.match(/\(([^)]+)\)/);
        if (match && match[1]) {
            return match[1];
        }
    } catch (error) {
        console.warn('Error extracting gradient content:', error);
    }
    
    return '#e94560 0%, #ff5c7a 100%';
}

