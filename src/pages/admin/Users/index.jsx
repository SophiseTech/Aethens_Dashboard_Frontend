import { useState, useEffect, useCallback } from "react";
import { Table, Button, Flex, Modal, Input, Select, message, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import Title from "@components/layouts/Title";
import StaffDetailsDrawer from "@components/StaffDetailsDrawer";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import usersV2Service from "@services/UsersV2";
import centersService from "@services/Centers";
import { useStore } from "zustand";
import { ROLES } from "@utils/constants";

function AdminUsers() {
  const { user } = useStore(userStore);
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [filters, setFilters] = useState({ search: "", role: "", status: "", center_id: "" });
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const canView = permissions.adminUsers?.view?.includes(user?.role);
  const canAdd = permissions.adminUsers?.add?.includes(user?.role);
  const canEdit = permissions.adminUsers?.edit?.includes(user?.role);
  const canDelete = permissions.adminUsers?.delete?.includes(user?.role);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.role) {
        params.role = filters.role;
      } else {
        params.role = [ROLES.FACULTY, ROLES.MANAGER, ROLES.OPERATIONS_MANAGER].join(",");
      }
      if (filters.status) params.status = filters.status;
      if (filters.center_id && filters.center_id !== "all") params.center_id = filters.center_id;

      const result = await usersV2Service.getAll(params);
      const data = result?.data ?? result?.users ?? result;
      const pag = result?.pagination ?? { total: result?.total ?? 0, page: pagination.page, limit: pagination.limit };
      setList(Array.isArray(data) ? data : []);
      setPagination((p) => ({ ...p, total: pag?.total ?? 0 }));
    } catch (e) {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.search, filters.role, filters.status, filters.center_id]);

  useEffect(() => {
    if (canView) {
      centersService.getCenters({}, 0, 200).then((res) => setCenters(res?.centers ?? []));
    }
  }, [canView]);

  useEffect(() => {
    if (canView) fetchUsers();
  }, [canView, pagination.page, pagination.limit, filters.search, filters.role, filters.status, filters.center_id]);

  const handlePageChange = (page, pageSize) => {
    setPagination((p) => ({ ...p, page, limit: pageSize || p.limit }));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete user?",
      content: `Remove ${record.username}? They will be deactivated.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await usersV2Service.delete(record._id);
          message.success("User deactivated");
          fetchUsers();
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  };

  const onSearch = () => fetchUsers();

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view users.</div>;
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      ellipsis: true,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <img
            className="rounded-full aspect-square w-8 2xl:w-10 border border-border"
            src={record?.profile_img || '/images/default.jpg'}
            alt="Profile"
          />
          <span className="max-2xl:text-xs">{name}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email", ellipsis: true },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "active" ? "green" : "default"}>{s}</Tag>,
    },
    {
      title: "Center",
      key: "center",
      render: (_, r) => r.center_id?.center_name ?? r.center_id ?? "—",
    },
    ...(canEdit || canDelete
      ? [
        {
          title: "Actions",
          key: "actions",
          render: (_, record) => (
            <Flex gap={8}>
              {canEdit && <Button size="small" onClick={() => navigate(`/admin/users/${record._id}`)}>Edit</Button>}
              {canDelete && <Button size="small" danger onClick={() => handleDelete(record)}>Delete</Button>}
            </Flex>
          ),
        },
      ]
      : []),
  ];

  return (
    <Title
      title="Staff (Admin)"
      button={
        canAdd ? (
          <Button type="primary" onClick={() => navigate("/admin/users/new")}>
            Add User
          </Button>
        ) : null
      }
    >
      <Flex className="mb-4 gap-3 flex-wrap">
        <Input.Search
          placeholder="Search by name"
          allowClear
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          onSearch={onSearch}
          style={{ width: 220 }}
        />
        <Select
          placeholder="Role"
          allowClear
          value={filters.role || undefined}
          onChange={(v) => setFilters((f) => ({ ...f, role: v || "" }))}
          style={{ width: 170 }}
          options={[
            { value: ROLES.FACULTY, label: "Faculty" },
            { value: ROLES.MANAGER, label: "Manager" },
            { value: ROLES.OPERATIONS_MANAGER, label: "Operations Manager" },
          ]}
        />
        <Select
          placeholder="Status"
          allowClear
          value={filters.status || undefined}
          onChange={(v) => setFilters((f) => ({ ...f, status: v || "" }))}
          style={{ width: 120 }}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        <Select
          placeholder="Center"
          allowClear
          value={filters.center_id || undefined}
          onChange={(v) => setFilters((f) => ({ ...f, center_id: v ?? "" }))}
          style={{ width: 180 }}
          options={[
            { value: "all", label: "All centers" },
            ...(centers?.map((c) => ({ value: c._id, label: c.center_name || c.location })) ?? []),
          ]}
        />
        <Button type="primary" onClick={onSearch}>Apply</Button>
      </Flex>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={list}
        loading={loading}
        onRow={(record) => {
          return {
            onClick: () => {
              setSelectedStaff(record);
              setIsDrawerVisible(true);
            },
            style: { cursor: "pointer" }
          };
        }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          onChange: handlePageChange,
        }}
      />
      <StaffDetailsDrawer
        user={selectedStaff}
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </Title>
  );
}

export default AdminUsers;

