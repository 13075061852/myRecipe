import { state } from "../state/app-state.js";
import { getMaterialById } from "./catalog.js";

export function getFormulaTotals() {
    const detailItems = state.formulaDraft.items.map((item) => {
        const material = getMaterialById(item.materialId);
        const lineCost = material ? (Number(item.percentage || 0) / 100) * material.pricePerKg : 0;

        return {
            ...item,
            material,
            lineCost
        };
    });

    const totalPercentage = detailItems.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    const totalCost = detailItems.reduce((sum, item) => sum + item.lineCost, 0);
    return { detailItems, totalPercentage, totalCost };
}
