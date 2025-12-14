import React, { useState } from "react";
import {
  Drawer,
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  Button,
  Tag,
  List,
} from "antd";
import {
  UserOutlined,
  WalletOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { formatDate } from "@utils/helper";
import { ROLES } from "@utils/constants";
import userStore from "@stores/UserStore";
import { useStore } from "zustand";

const { Title, Text } = Typography;

const WalletDrawer = ({
  wallet,
  visible,
  onClose,
  onTopupClick, // callback → open topup modal
}) => {
  const { user: loggedinUser } = useStore(userStore);

  if (!wallet) return null;

  const student = wallet.student;

  return (
    <Drawer
      title="Wallet Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={420}
      headerStyle={{
        background: "#f0f2f5",
        borderBottom: "1px solid #e8e8e8",
      }}
      bodyStyle={{ padding: 20 }}
      extra={
        loggedinUser.role !== ROLES.FACULTY && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onTopupClick}
          >
            Top Up
          </Button>
        )
      }
    >
      {/* Student Header */}
      <Card bordered={false} style={{ background: "transparent" }}>
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar
              size={64}
              src={student?.profile_img}
              icon={<UserOutlined />}
            />
          </Col>
          <Col>
            <Title level={4} style={{ marginBottom: 0 }}>
              {student?.username}
            </Title>
            <Text type="secondary">{student?.email}</Text>
            <br />
            <Text type="secondary">
              Adm No: {student?.details_id?.admissionNumber}
            </Text>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Wallet Summary */}
      <Card bordered={false} style={{ background: "transparent" }}>
        <Title level={5}>
          <WalletOutlined /> Wallet Summary
        </Title>

        <Row gutter={[16, 12]}>
          <Col span={24}>
            <Text strong>Current Balance:</Text>{" "}
            <Tag color="green">₹ {wallet.balance}</Tag>
          </Col>

          <Col span={24}>
            <Text strong>Total Credited:</Text>{" "}
            <Text>₹ {wallet.totalCredited}</Text>
          </Col>

          <Col span={24}>
            <Text strong>Total Debited:</Text>{" "}
            <Text>₹ {wallet.totalDebited}</Text>
          </Col>

          <Col span={24}>
            <Text strong>Last Updated:</Text>{" "}
            <Text>{formatDate(wallet.updatedAt)}</Text>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Transactions */}
      <Card bordered={false} style={{ background: "transparent" }}>
        <Title level={5}>Recent Transactions</Title>

        <List
          dataSource={wallet.transactions || []}
          locale={{ emptyText: "No transactions yet" }}
          renderItem={(tx) => (
            <List.Item>
              <Row style={{ width: "100%" }}>
                <Col span={16}>
                  <Text strong>
                    {tx.type === "credit" ? "Credited" : "Debited"}
                  </Text>
                  <br />
                  <Text type="secondary">
                    {tx.source} • {formatDate(tx.createdAt)}
                  </Text>
                </Col>
                <Col span={8} style={{ textAlign: "right" }}>
                  <Tag color={tx.type === "credit" ? "green" : "red"}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                  </Tag>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Card>
    </Drawer>
  );
};

export default WalletDrawer;
