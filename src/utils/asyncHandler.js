export const asyncHandler = (requestHandler) => async(req, res, next) => {
    try {
        return await requestHandler(req, res, next);
        // res.status().send();
    } catch (error) {
        // res.status().send();
    }
}