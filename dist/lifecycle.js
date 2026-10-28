export function transition(mode, action) {
    if (action === 'dispose')
        return 'disposed';
    if (mode === 'failed' || mode === 'disposed')
        return mode;
    if (action === 'fail')
        return 'failed';
    if (action === 'resume')
        return 'active';
    return mode === 'active' ? 'paused' : mode;
}
