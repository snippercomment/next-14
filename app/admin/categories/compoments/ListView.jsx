"use client";
import { Button, CircularProgress, Chip } from "@nextui-org/react";
import { useCategories } from "@/lib/firestore/categories/read";
import { Edit2, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { deleteCategory } from "@/lib/firestore/categories/write";
import { useRouter } from "next/navigation";

export default function ListView() {
    const { data: categories, error, isLoading } = useCategories();
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        )
    }
    if (error) {
        return <div>{error}</div>
    }

    // Tổ chức categories thành cấu trúc cha-con
    const organizeCategories = (categories) => {
        if (!categories) return [];
        
        const parentCategories = categories.filter(cat => !cat.parentId);
        const childCategories = categories.filter(cat => cat.parentId);
        
        return parentCategories.map(parent => ({
            ...parent,
            children: childCategories.filter(child => child.parentId === parent.id)
        }));
    };

    const organizedCategories = organizeCategories(categories);

    const toggleExpand = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    return (
        <div className="flex-1 flex flex-col gap-4 md:pr-5 md:px-0 px-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý thể loại</h1>
                <Chip color="primary" variant="flat">
                    {categories?.length || 0} thể loại
                </Chip>
            </div>
            
            <div className="space-y-3">
                {organizedCategories?.map((parent) => (
                    <ParentCategoryCard 
                        key={parent.id} 
                        parent={parent} 
                        isExpanded={expandedCategories.has(parent.id)}
                        onToggleExpand={() => toggleExpand(parent.id)}
                    />
                ))}
            </div>
        </div>
    )
}

function ParentCategoryCard({ parent, isExpanded, onToggleExpand }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    
    const handleDelete = async (categoryId) => {
        if (!confirm("Bạn có chắc chắn muốn xoá Thể loại này không?")) return;
        setIsDeleting(true);
        try {
            await deleteCategory({ id: categoryId });
            toast.success("Xoá Thể loại thành công");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsDeleting(false);
    };
    
    const handleUpdate = (categoryId) => {
        router.push(`/admin/categories?id=${categoryId}`);
    }

    const handleAddChild = (parentId) => {
        router.push(`/admin/categories?parentId=${parentId}`);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header - Thể loại cha */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleExpand}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                        disabled={parent.children?.length === 0}
                    >
                        {parent.children?.length > 0 ? (
                            isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />
                        ) : (
                            <div className="w-5 h-5" />
                        )}
                    </button>
                    
                    <img 
                        src={parent.imageURL} 
                        alt={parent.name} 
                        className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm" 
                    />
                    
                    <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{parent.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Chip size="sm" color="primary" variant="flat">
                                Thể loại cha
                            </Chip>
                            {parent.children?.length > 0 && (
                                <Chip size="sm" color="success" variant="flat">
                                    {parent.children.length} Thể loại con
                                </Chip>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleAddChild(parent.id)}
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Plus size={16} />}
                    >
                        Thêm
                    </Button>
                    <Button
                        onClick={() => handleUpdate(parent.id)}
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        size="sm"
                        variant="flat"
                        isIconOnly
                    >
                        <Edit2 size={16} />
                    </Button>
                    <Button
                        onClick={() => handleDelete(parent.id)}
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        size="sm"
                        color="danger"
                        variant="flat"
                        isIconOnly
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
            
            {/* Content - Thể loại con */}
            {isExpanded && parent.children?.length > 0 && (
                <div className="bg-gray-50 p-4">
                    <div className="grid gap-3">
                        {parent.children.map((child) => (
                            <ChildCategoryCard 
                                key={child.id} 
                                child={child} 
                                parentName={parent.name}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Empty state khi không có con */}
            {isExpanded && parent.children?.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                    <p className="mb-3">Chưa có thể loại con nào</p>
                    <Button
                        onClick={() => handleAddChild(parent.id)}
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Plus size={16} />}
                    >
                        Tạo thể loại con đầu tiên
                    </Button>
                </div>
            )}
        </div>
    );
}

function ChildCategoryCard({ child, parentName }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    
    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xoá Thể loại con này không?")) return;
        setIsDeleting(true);
        try {
            await deleteCategory({ id: child.id });
            toast.success("Xoá Thể loại con thành công");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsDeleting(false);
    };
    
    const handleUpdate = () => {
        router.push(`/admin/categories?id=${child.id}`);
    }

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-400 rounded-full"></div>
                <img 
                    src={child.imageURL} 
                    alt={child.name} 
                    className="w-10 h-10 object-cover rounded-lg border border-gray-200" 
                />
                <div>
                    <h4 className="font-medium text-gray-700">{child.name}</h4>
                    <p className="text-sm text-gray-500">Thuộc: {parentName}</p>
                </div>
            </div>
            
            <div className="flex gap-2">
                <Button
                    onClick={handleUpdate}
                    isLoading={isDeleting}
                    isDisabled={isDeleting}
                    size="sm"
                    variant="flat"
                    isIconOnly
                >
                    <Edit2 size={14} />
                </Button>
                <Button
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    isDisabled={isDeleting}
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    );
}