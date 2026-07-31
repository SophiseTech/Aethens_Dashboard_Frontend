import { Button, Card, Collapse, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import SubjectsFormSection from './SubjectsFormSection';

const { Text } = Typography;
const { Panel } = Collapse;

/**
 * Wraps SubjectsFormSection one level up so subjects (and their modules) are
 * segregated per term. This lets the same subject name repeat across terms
 * with different module content.
 */
function TermsFormSection({ value = [], onChange }) {
    const terms = value || [];

    const handleAddTerm = () => {
        onChange([...terms, { termNumber: terms.length + 1, subjects: [] }]);
    };

    const handleRemoveTerm = (termIndex) => {
        onChange(
            terms
                .filter((_, i) => i !== termIndex)
                .map((term, i) => ({ ...term, termNumber: i + 1 }))
        );
    };

    const handleSubjectsChange = (termIndex, subjects) => {
        const newTerms = [...terms];
        newTerms[termIndex] = { ...newTerms[termIndex], subjects };
        onChange(newTerms);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <Text strong>Terms</Text>
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddTerm} size="small">
                    Add Term
                </Button>
            </div>

            {terms.length === 0 ? (
                <Card size="small">
                    <Text type="secondary">No terms added yet. Click "Add Term" to begin.</Text>
                </Card>
            ) : (
                <Collapse accordion>
                    {terms.map((term, termIndex) => (
                        <Panel
                            header={
                                <div className="flex justify-between items-center">
                                    <span>Term {term.termNumber}</span>
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTerm(termIndex);
                                        }}
                                    />
                                </div>
                            }
                            key={termIndex}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <SubjectsFormSection
                                    value={term.subjects}
                                    onChange={(subjects) => handleSubjectsChange(termIndex, subjects)}
                                />
                            </Space>
                        </Panel>
                    ))}
                </Collapse>
            )}
        </div>
    );
}

export default TermsFormSection;
