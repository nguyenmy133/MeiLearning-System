import { useQuery } from "@tanstack/react-query";
import { documentService } from "../services/documentService";

export const useDocuments = (classId?: number) => {
    return useQuery({
        queryKey: ["user", "documents", classId],
        queryFn: () => documentService.getDocuments(classId),
    });
};

export const useCourses = () => {
    return useQuery({
        queryKey: ["user", "document-courses"],
        queryFn: () => documentService.getCourses(),
    });
};
