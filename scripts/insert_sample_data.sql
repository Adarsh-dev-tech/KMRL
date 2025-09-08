-- Sample data for testing
USE kmrl_docs;

-- Insert sample users
INSERT INTO users (employee_id, department, password_hash) VALUES
('KMRL001', 'admin', '$2b$10$example_hash_for_admin_user'),
('KMRL002', 'finance', '$2b$10$example_hash_for_finance_user'),
('KMRL003', 'operations', '$2b$10$example_hash_for_operations_user');

-- Insert sample file records
INSERT INTO files (
    file_location, 
    images_folder_link, 
    tables_folder_link, 
    scanToText_link, 
    summary_text_link, 
    sender, 
    platform
) VALUES (
    'C:\\Users\\adars\\Desktop\\Project\\sampleDB\\Moulding Sand.pdf',
    'C:\\Users\\adars\\Desktop\\Project\\sampleDB\\images',
    'C:\\Users\\adars\\Desktop\\Project\\sampleDB\\tables',
    'C:\\Users\\adars\\Desktop\\Project\\sampleDB\\scanToText.txt',
    'C:\\Users\\adars\\Desktop\\Project\\sampleDB\\summary.txt',
    'MinistryOfEducation@gov.in',
    'WhatsApp'
);
