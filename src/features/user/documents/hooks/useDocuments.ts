import { useQuery } from "@tanstack/react-query";
import { documentService } from "../services/documentService";

export const useDocuments = () => {
    return useQuery({
        queryKey: ["user", "documents"],
        queryFn: () => documentService.getDocuments(),
    });
};

export const useCourses = () => {
    return useQuery({
        queryKey: ["user", "document-courses"],
        queryFn: () => documentService.getCourses(),
    });
};
