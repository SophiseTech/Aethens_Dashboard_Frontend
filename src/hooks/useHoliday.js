import holidayStore from "@stores/HolidayStore";
import { useMemo } from "react";
import { useStore } from "zustand";

function useHoliday() {
  const {
    holidays,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    total,
    page,
    limit,
    filters,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    setFilters,
    setLimit
  } = useStore(holidayStore);

  // Status options for dropdown
  const statusOptions = useMemo(
    () => [
      { label: "Published", value: "published" },
      { label: "Unpublished", value: "unpublished" },
      { label: "Archived", value: "archived" }
    ],
    []
  );

  return {
    holidays,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    total,
    page,
    limit,
    filters,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    setFilters,
    setLimit,
    statusOptions
  };
}

export default useHoliday;
