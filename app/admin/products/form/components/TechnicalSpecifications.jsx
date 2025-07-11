"use client";

import { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";

export default function TechnicalSpecifications({ data, handleData }) {
    const [newSpec, setNewSpec] = useState({ key: "", value: "" });

    const technicalSpecs = useMemo(() => {
        const raw = data?.technicalSpecs;

        if (!raw) return [];

        if (typeof raw === "string") {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }

        if (Array.isArray(raw)) {
            return raw.filter(spec =>
                spec && typeof spec === "object" &&
                !Array.isArray(spec) &&
                (spec.key !== undefined || spec.value !== undefined)
            );
        }

        return [];
    }, [data?.technicalSpecs]);

    const handleAddSpec = () => {
        if (newSpec.key && newSpec.key.trim() && newSpec.value && newSpec.value.trim()) {
            const newSpecItem = {
                id: `techspec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                key: String(newSpec.key).trim(),
                value: String(newSpec.value).trim()
            };

            const updatedSpecs = [...technicalSpecs, newSpecItem];
            handleData("technicalSpecs", updatedSpecs);
            setNewSpec({ key: "", value: "" });
        }
    };

    const handleRemoveSpec = (id) => {
        const updatedSpecs = technicalSpecs.filter(spec => spec.id !== id);
        handleData("technicalSpecs", updatedSpecs);
    };

    const handleEditSpec = (id, field, value) => {
        const updatedSpecs = technicalSpecs.map(spec =>
            spec.id === id ? { ...spec, [field]: String(value) } : spec
        );
        handleData("technicalSpecs", updatedSpecs);
    };

    const normalizedSpecs = useMemo(() => {
        return technicalSpecs.map((spec, index) => ({
            ...spec,
            id: spec.id || `techspec_${Date.now()}_${index}`
        }));
    }, [technicalSpecs]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex gap-2 items-center p-4 border-b border-gray-200">
                    <h2 className="font-semibold">Thông số kỹ thuật</h2>
                </div>

                <div className="p-4">
                    {/* Form thêm thông số mới */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Tên thông số "
                            value={newSpec.key || ""}
                            onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                            type="text"
                            placeholder="Giá trị chi tiết "
                            value={newSpec.value || ""}
                            onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                            onClick={handleAddSpec}
                            disabled={!newSpec.key?.trim() || !newSpec.value?.trim()}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Danh sách thông số hiện tại */}
                    <div className="space-y-2">
                        {normalizedSpecs.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                Chưa có thông số kỹ thuật chi tiết nào. Hãy thêm thông số đầu tiên!
                            </div>
                        ) : (
                            normalizedSpecs.map((spec) => (
                                <div key={spec.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Tên thông số"
                                            value={spec.key || ""}
                                            onChange={(e) => handleEditSpec(spec.id, "key", e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Giá trị"
                                            value={spec.value || ""}
                                            onChange={(e) => handleEditSpec(spec.id, "value", e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveSpec(spec.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Hiển thị số lượng thông số */}
                    {normalizedSpecs.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                            Đã thêm {normalizedSpecs.length} thông số kỹ thuật chi tiết
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
