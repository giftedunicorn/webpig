export const serialize = function(object) {
    return JSON.stringify(object, null, 2);
};

export async function waiting(time) {
    if (typeof time !== 'number') return;

    time = time || 1000;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
