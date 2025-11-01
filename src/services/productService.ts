import api from "./api";

export const getAllProducts = async () => {
    const res = await api.get("/products");
    return res.data;
};

export const addProduct = async (data: any) => {
    const res = await api.post("/products/add", data);
    return res.data;
}