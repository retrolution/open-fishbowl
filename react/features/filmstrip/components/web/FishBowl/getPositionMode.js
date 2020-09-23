export const getPositionMode = () => {
    if (window.innerHeight > (window.innerWidth * 1.5)) {
        return 'narrow';
    }
    if (window.innerWidth > (window.innerHeight * 1.5)) {
        return 'wide';
    }

    return 'square';
};
