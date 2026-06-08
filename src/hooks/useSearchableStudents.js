import userService from "@services/User";
import logger from "@utils/logger";
import { useState } from "react";

export default function useSearchableStudents() {
    const [students, setStudents] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)


    const searchStudents = async (page = 0, limit = 0, query = {}) => {
        try {
            let searchQuery = query.searchQuery
            if (!searchQuery) {
                searchQuery = 'A'
                logger.info("No search query provided. Searching with default 'A'")
            }
            logger.info("Search query", searchQuery)
            setLoading(true)
            const filters = { searchQuery }
            const response = await userService.search(page, limit, filters)
            setStudents(response.users)
            setTotal(response.total)
        } catch (error) {
            handleInternalError(error)
        } finally {
            setLoading(false)
        }
    }

    return { students, total, loading, searchStudents }

}