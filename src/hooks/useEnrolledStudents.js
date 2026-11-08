import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import debounce from 'lodash/debounce';
import userStore from '@stores/UserStore';
import useAlert from '@hooks/useAlert';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

// Drives the dashboard "Enrolled Students" modal: lists the students behind the
// count, using the same center + date range as the last summary fetch
// (userStore.summaryFilters), so the list always matches the number shown.
function useEnrolledStudents(open) {
  const summaryFilters = useStore(userStore, (state) => state.summaryFilters);
  const getSummaryStudents = useStore(userStore, (state) => state.getSummaryStudents);
  const alert = useAlert();

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const requestSeq = useRef(0);

  const range = useMemo(() => {
    const query = summaryFilters?.query || {};
    return {
      centerId: query.center_id || 'all',
      from: query.createdAt?.$gte,
      to: query.createdAt?.$lte,
    };
  }, [summaryFilters]);

  const applySearch = useMemo(
    () => debounce((value) => { setSearch(value.trim()); setPage(1); }, SEARCH_DEBOUNCE_MS),
    []
  );
  useEffect(() => () => applySearch.cancel(), [applySearch]);

  // Start fresh each time the modal opens or the dashboard range changes
  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSearch('');
    setSearchInput('');
  }, [open, range]);

  useEffect(() => {
    if (!open || !range.from || !range.to) return;
    const seq = ++requestSeq.current;
    setLoading(true);
    getSummaryStudents({ ...range, search, page, limit: PAGE_SIZE })
      .then((data) => {
        if (seq !== requestSeq.current) return;
        setStudents(data?.students || []);
        setTotal(data?.total || 0);
      })
      .catch((error) => {
        if (seq === requestSeq.current) alert.error(error.message || 'Failed to load students');
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  }, [open, range, search, page, getSummaryStudents]);

  const onSearchChange = (value) => {
    setSearchInput(value);
    applySearch(value);
  };

  return {
    students,
    total,
    page,
    pageSize: PAGE_SIZE,
    loading,
    searchInput,
    from: range.from,
    to: range.to,
    onSearchChange,
    onPageChange: setPage,
  };
}

export default useEnrolledStudents;
