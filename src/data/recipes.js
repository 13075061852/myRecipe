export const seedRecipes = [
    {
        id: "RCP-2401",
        name: "PBT GF30 阻燃连接器料",
        family: "PBT",
        application: "连接器",
        process: "注塑",
        status: "量产",
        target: "GF30、V-0、尺寸稳定",
        updatedAt: "2026-03-26",
        costPerKg: 18.92,
        totalPercentage: 100,
        items: [
            { materialId: "MAT-PBT-001", percentage: 61, note: "主基材" },
            { materialId: "MAT-PBT-002", percentage: 30, note: "增强" },
            { materialId: "MAT-PBT-003", percentage: 8, note: "阻燃" },
            { materialId: "MAT-REC-001", percentage: 1, note: "微量回料" }
        ]
    },
    {
        id: "RCP-2402",
        name: "PET 增韧外观件料",
        family: "PET",
        application: "家电外观件",
        process: "注塑",
        status: "试样",
        target: "高光、抗冲击、流动性好",
        updatedAt: "2026-03-18",
        costPerKg: 13.74,
        totalPercentage: 100,
        items: [
            { materialId: "MAT-PET-001", percentage: 92, note: "主基材" },
            { materialId: "MAT-PET-002", percentage: 8, note: "增韧" }
        ]
    },
    {
        id: "RCP-2403",
        name: "PA66 耐热骨架料",
        family: "PA66",
        application: "汽车电器骨架",
        process: "注塑",
        status: "中试",
        target: "耐热、强度、热老化稳定",
        updatedAt: "2026-03-12",
        costPerKg: 25.33,
        totalPercentage: 100,
        items: [
            { materialId: "MAT-PA66-001", percentage: 97, note: "主基材" },
            { materialId: "MAT-PA66-002", percentage: 3, note: "耐热稳定" }
        ]
    }
];
