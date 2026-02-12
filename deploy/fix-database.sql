-- Fix database: Create church, assign user, seed categories
-- Run inside church-db-prod container

-- Step 1: Create the church
INSERT INTO churches (name, currency, country, fiscal_year_start_month, is_active)
VALUES ('Church Excellence', 'ZAR', 'South Africa', 1, true);

-- Step 2: Assign user to church and make them admin
UPDATE users SET church_id = 1, role = 'ADMIN' WHERE id = 1;

-- Step 3: Seed income categories
INSERT INTO income_categories (church_id, name, description, is_tax_deductible, sort_order, is_active) VALUES
(1, 'Tithes', 'Regular tithes from members', true, 1, true),
(1, 'First Fruits', 'First fruits offerings', true, 2, true),
(1, 'Regular Seed', 'General seed offerings', true, 3, true),
(1, 'Alms', 'Alms and relief support', true, 4, true),
(1, 'Special Seed', 'Special or sacrificial seeds', true, 5, true),
(1, 'Other Income', 'Miscellaneous income', true, 99, true);

-- Step 4: Seed expense categories
INSERT INTO expense_categories (church_id, name, description, sort_order, is_active) VALUES
(1, 'Senior Pastor Salary', 'Senior pastor compensation', 1, true),
(1, 'Associate Pastor Salary', 'Associate pastor compensation', 2, true),
(1, 'Admin Staff Salary', 'Administrative staff wages', 3, true),
(1, 'Worship Team Stipends', 'Musicians and worship leader payments', 4, true),
(1, 'Security Personnel', 'Security guards and safety team', 5, true),
(1, 'Cleaning Staff', 'Janitorial and cleaning services', 6, true),
(1, 'Rent / Mortgage', 'Building rent or mortgage payments', 10, true),
(1, 'Electricity', 'Monthly electricity bills', 11, true),
(1, 'Water & Sewage', 'Water and sewage utilities', 12, true),
(1, 'Internet & Phone', 'Telecommunications', 13, true),
(1, 'Building Maintenance', 'Repairs and maintenance', 14, true),
(1, 'Insurance', 'Property and liability insurance', 15, true),
(1, 'Printing & Stationery', 'Office supplies and printing', 20, true),
(1, 'Computer Equipment', 'Technology and hardware', 21, true),
(1, 'Software Subscriptions', 'Church software and apps', 22, true),
(1, 'Postage & Shipping', 'Mailing costs', 23, true),
(1, 'Sunday School Materials', 'Educational resources', 30, true),
(1, 'Youth Ministry', 'Youth programs and activities', 31, true),
(1, 'Children Ministry', 'Children programs and supplies', 32, true),
(1, 'Men Ministry', 'Men fellowship activities', 33, true),
(1, 'Women Ministry', 'Women fellowship activities', 34, true),
(1, 'Sound Equipment', 'Audio/visual equipment', 40, true),
(1, 'Musical Instruments', 'Instruments purchase and maintenance', 41, true),
(1, 'Worship Supplies', 'Communion, flowers, decorations', 42, true),
(1, 'Missions Support', 'Missionary support and outreach', 50, true),
(1, 'Community Outreach', 'Local community programs', 51, true),
(1, 'Evangelism Materials', 'Tracts, flyers, campaigns', 52, true),
(1, 'Benevolence / Relief', 'Assistance to members in need', 60, true),
(1, 'Food Parcels', 'Food bank and parcels', 61, true),
(1, 'Funeral Assistance', 'Bereavement support', 62, true),
(1, 'Conference & Events', 'Church conferences and events', 70, true),
(1, 'Guest Speaker Fees', 'Honorariums for guest speakers', 71, true),
(1, 'Catering', 'Food and refreshments for events', 72, true),
(1, 'Vehicle Fuel', 'Church vehicle fuel', 80, true),
(1, 'Vehicle Maintenance', 'Church vehicle repairs', 81, true),
(1, 'Transport Hire', 'Bus/van hire for events', 82, true),
(1, 'Bank Charges', 'Banking and transaction fees', 90, true),
(1, 'Accounting Fees', 'Bookkeeping and audit costs', 91, true),
(1, 'Legal Fees', 'Legal services', 92, true),
(1, 'Miscellaneous', 'Other unclassified expenses', 99, true);

-- Verify
SELECT 'Churches:' AS info, count(*) FROM churches
UNION ALL
SELECT 'Users with church:', count(*) FROM users WHERE church_id IS NOT NULL
UNION ALL
SELECT 'Income Categories:', count(*) FROM income_categories
UNION ALL
SELECT 'Expense Categories:', count(*) FROM expense_categories;

SELECT id, email, role, church_id FROM users;
