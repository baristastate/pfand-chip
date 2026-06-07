-- Demo Beers
insert into beers (id, name, type, description) values
(uuid_generate_v4(), 'Münchner Kindl Helles', 'Helles', 'Der Klassiker aus der Au.'),
(uuid_generate_v4(), 'Münchner Kindl Dunkel', 'Dunkel', 'Malzig und süffig.');

-- Demo Customers
insert into customers (id, name, customer_type, address) values
(uuid_generate_v4(), 'Braugarten am Isartor', 'GASTRO', 'Isartorplatz 1, 80331 München'),
(uuid_generate_v4(), 'Getränkequelle Sendling', 'RETAIL', 'Lindwurmstr. 50, 80337 München');

-- Demo Barrels
insert into barrels (id, barrel_number, size_liters, status) values
(uuid_generate_v4(), 'BAR-10-001', 10, 'AVAILABLE'),
(uuid_generate_v4(), 'BAR-30-001', 30, 'AVAILABLE'),
(uuid_generate_v4(), 'BAR-200-001', 200, 'AVAILABLE');

-- Demo RFID Tags
insert into rfid_tags (rfid_uid, barrel_id)
select 'E004015020304050', id from barrels where barrel_number = 'BAR-10-001';
insert into rfid_tags (rfid_uid, barrel_id)
select 'E004015020304051', id from barrels where barrel_number = 'BAR-30-001';
