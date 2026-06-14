-- Insert courses (certification levels)
INSERT INTO courses (level, title, description, icon, color, order_index) VALUES
(1, 'Основи RouterOS', 'WinBox, Інтерфейси, IP Address, DHCP Client/Server, DNS', 'router', '#2E86DE', 1),
(2, 'Routing', 'Static Routes, NAT, Firewall Basics', 'route', '#10AC84', 2),
(3, 'VLAN та Switching', 'Bridge, VLAN, Trunk, Access Port', 'switch', '#F39C12', 3),
(4, 'VPN', 'WireGuard, L2TP/IPsec, OpenVPN', 'shield', '#9B59B6', 4),
(5, 'Security', 'Firewall, Address Lists, Port Forwarding, DDoS Protection', 'lock', '#E74C3C', 5),
(6, 'Enterprise', 'OSPF, BGP, Multi-WAN, High Availability', 'building', '#1ABC9C', 6);

-- Insert labs for Level 1 (Основи RouterOS)
INSERT INTO labs (course_id, title, description, difficulty, objectives, tasks, points, order_index) VALUES
((SELECT id FROM courses WHERE level = 1), 
 'Знайомство з WinBox', 
 'Ознайомлення з інтерфейсом WinBox та базовою конфігурацією роутера',
 'beginner',
 '["Оволодіти навичками роботи з WinBox", "Налаштувати базові параметри роутера"]'::jsonb,
 '[{"title": "Підключення до роутера", "description": "Підключіться до роутера через WinBox використовуючи MAC-адресу"}, {"title": "Перегляд системної інформації", "description": "Перевірте версію RouterOS та системні ресурси"}]'::jsonb,
 100, 1),

((SELECT id FROM courses WHERE level = 1), 
 'Налаштування IP адрес', 
 'Конфігурація IP адрес на інтерфейсах',
 'beginner',
 '["Налаштувати IP адреси на інтерфейсах", "Перевірити зв''язність"]'::jsonb,
 '[{"title": "Налаштувати IP на ether1", "description": "Призначити IP адресу 192.168.1.1/24 на інтерфейс ether1"}, {"title": "Налаштувати IP на ether2", "description": "Призначити IP адресу 10.0.0.1/24 на інтерфейс ether2"}]'::jsonb,
 150, 2),

((SELECT id FROM courses WHERE level = 1), 
 'DHCP Server', 
 'Створення та налаштування DHCP сервера',
 'intermediate',
 '["Створити DHCP сервер", "Налаштувати пул адрес"]'::jsonb,
 '[{"title": "Створити DHCP pool", "description": "Створити пул адрес 192.168.1.100-192.168.1.200"}, {"title": "Налаштувати DHCP network", "description": "Вказати шлюз та DNS для мережі"}]'::jsonb,
 200, 3),

((SELECT id FROM courses WHERE level = 1), 
 'DNS налаштування', 
 'Конфігурація DNS сервера та кешування',
 'intermediate',
 '["Налаштувати DNS сервер", "Дозволити remote requests"]'::jsonb,
 '[{"title": "Активувати DNS", "description": "Увімкнути DNS сервер з remote requests"}, {"title": "Додати статичні записи", "description": "Створити A-запис для локального сервера"}]'::jsonb,
 150, 4);

-- Insert labs for Level 2 (Routing)
INSERT INTO labs (course_id, title, description, difficulty, objectives, tasks, points, order_index) VALUES
((SELECT id FROM courses WHERE level = 2), 
 'Static Routing', 
 'Налаштування статичних маршрутів',
 'intermediate',
 '["Створити статичні маршрути", "Перевірити маршрутну таблицю"]'::jsonb,
 '[{"title": "Додати статичний маршрут", "description": "Створити маршрут до мережі 10.10.0.0/24 через шлюз 192.168.1.254"}]'::jsonb,
 200, 1),

((SELECT id FROM courses WHERE level = 2), 
 'NAT налаштування', 
 'Конфігурація NAT для доступу до Інтернет',
 'intermediate',
 '["Налаштувати masquerade", "Забезпечити доступ до Інтернет"]'::jsonb,
 '[{"title": "Створити NAT rule", "description": "Додати masquerade rule для вихідного трафіку"}]'::jsonb,
 250, 2),

((SELECT id FROM courses WHERE level = 2), 
 'Firewall Basics', 
 'Базові правила фаєрволу',
 'intermediate',
 '["Створити firewall filter rules", "Захистити роутер"]'::jsonb,
 '[{"title": "Заблокувати невідомі з''єднання", "description": "Додати правило drop для invalid з''єднань"}, {"title": "Дозволити established", "description": "Дозволити established та related з''єднання"}]'::jsonb,
 300, 3);

-- Insert labs for Level 3 (VLAN)
INSERT INTO labs (course_id, title, description, difficulty, objectives, tasks, points, order_index) VALUES
((SELECT id FROM courses WHERE level = 3), 
 'Bridge налаштування', 
 'Створення та конфігурація bridge',
 'intermediate',
 '["Створити bridge", "Додати порти в bridge"]'::jsonb,
 '[{"title": "Створити bridge", "description": "Створити bridge interface"}, {"title": "Додати порти", "description": "Додати ether2 та ether3 до bridge"}]'::jsonb,
 200, 1),

((SELECT id FROM courses WHERE level = 3), 
 'VLAN налаштування', 
 'Конфігурація VLAN на роутері',
 'intermediate',
 '["Створити VLAN interfaces", "Налаштувати VLAN tagging"]'::jsonb,
 '[{"title": "Створити VLAN 10", "description": "Створити VLAN interface з ID 10 на bridge"}, {"title": "Створити VLAN 20", "description": "Створити VLAN interface з ID 20 на bridge"}]'::jsonb,
 250, 2),

((SELECT id FROM courses WHERE level = 3), 
 'Trunk та Access', 
 'Налаштування trunk та access портів',
 'advanced',
 '["Налаштувати trunk port", "Налаштувати access ports"]'::jsonb,
 '[{"title": "Налаштувати trunk", "description": "Налаштувати порт з VLAN 10,20 tagged"}, {"title": "Налаштувати access", "description": "Налаштувати порти з untagged VLAN"}]'::jsonb,
 300, 3);

-- Insert labs for Level 4 (VPN)
INSERT INTO labs (course_id, title, description, difficulty, objectives, tasks, points, order_index) VALUES
((SELECT id FROM courses WHERE level = 4), 
 'WireGuard VPN', 
 'Налаштування WireGuard VPN тунелю',
 'advanced',
 '["Створити WireGuard interface", "Налаштувати peers"]'::jsonb,
 '[{"title": "Створити WireGuard", "description": "Створити WireGuard interface з приватним ключем"}, {"title": "Додати peer", "description": "Налаштувати peer з публічним ключем та endpoint"}]'::jsonb,
 350, 1),

((SELECT id FROM courses WHERE level = 4), 
 'L2TP/IPsec', 
 'Налаштування L2TP/IPsec VPN сервера',
 'advanced',
 '["Налаштувати L2TP server", "Конфігурація IPsec"]'::jsonb,
 '[{"title": "Активувати L2TP", "description": "Налаштувати L2TP server з IPsec"}, {"title": "Створити secrets", "description": "Додати користувача для VPN"}]'::jsonb,
 400, 2);

-- Insert labs for Level 5 (Security)
INSERT INTO labs (course_id, title, description, difficulty, objectives, tasks, points, order_index) VALUES
((SELECT id FROM courses WHERE level = 5), 
 'Firewall Advanced', 
 'Розширені правила фаєрволу',
 'advanced',
 '["Створити address lists", "Налаштувати filter rules"]'::jsonb,
 '[{"title": "Створити address list", "description": "Додати address list для довірених мереж"}, {"title": "Створити rules", "description": "Налаштувати правила фаєрволу з address lists"}]'::jsonb,
 300, 1),

((SELECT id FROM courses WHERE level = 5), 
 'Port Forwarding', 
 'Налаштування port forwarding',
 'advanced',
 '["Створити DST-NAT rules", "Перенаправити порти"]'::jsonb,
 '[{"title": "Forward port 80", "description": "Перенаправити порт 80 на внутрішній web сервер"}, {"title": "Forward port 22", "description": "Перенаправити SSH на внутрішній сервер"}]'::jsonb,
 350, 2),

((SELECT id FROM courses WHERE level = 5), 
 'DDoS Protection', 
 'Захист від DDoS атак',
 'advanced',
 '["Налаштувати connection tracking", "Обмежити з''єднання"]'::jsonb,
 '[{"title": "Connection limits", "description": "Встановити ліміт з''єднань на один IP"}, {"title": "Drop flood", "description": "Блокувати надмірні з''єднання"}]'::jsonb,
 400, 3);

-- Insert labs for Level 6 (Enterprise)
INSERT INTO labs (course_id, title, description, difficulty, objectives, tasks, points, order_index) VALUES
((SELECT id FROM courses WHERE level = 6), 
 'OSPF', 
 'Налаштування OSPF маршрутизації',
 'advanced',
 '["Налаштувати OSPF instances", "Конфігурація OSPF areas"]'::jsonb,
 '[{"title": "Створити OSPF instance", "description": "Активувати OSPF v2"}, {"title": "Налаштувати area", "description": "Додати network до OSPF area 0"}]'::jsonb,
 450, 1),

((SELECT id FROM courses WHERE level = 6), 
 'Multi-WAN', 
 'Налаштування декількох ISP',
 'advanced',
 '["Налаштувати load balancing", "Конфігурація failover"]'::jsonb,
 '[{"title": "Налаштувати ECMP", "description": "Створити routes з ECMP balancing"}, {"title": "Failover", "description": "Налаштувати check gateway для failover"}]'::jsonb,
 500, 2),

((SELECT id FROM courses WHERE level = 6), 
 'High Availability', 
 'Налаштування відмовостійкості',
 'advanced',
 '["Налаштувати VRRP", "Конфігурація redundancy"]'::jsonb,
 '[{"title": "Створити VRRP", "description": "Налаштувати VRRP interface"}, {"title": "Master/Backup", "description": "Конфігурація пріоритетів для master/backup"}]'::jsonb,
 500, 3);

-- Insert achievements
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
('Перші кроки', 'Виконано першу лабораторну роботу', 'award', '{"type": "labs_completed", "count": 1}'::jsonb, 50),
('Студент', 'Виконано 10 лабораторних робіт', 'graduation-cap', '{"type": "labs_completed", "count": 10}'::jsonb, 100),
('Професіонал', 'Виконано 25 лабораторних робіт', 'star', '{"type": "labs_completed", "count": 25}'::jsonb, 250),
('Експерт', 'Виконано 50 лабораторних робіт', 'trophy', '{"type": "labs_completed", "count": 50}'::jsonb, 500),
('Рівень 1', 'Завершено курс Основи RouterOS', 'check-circle', '{"type": "course_completed", "level": 1}'::jsonb, 200),
('Рівень 2', 'Завершено курс Routing', 'check-circle', '{"type": "course_completed", "level": 2}'::jsonb, 300),
('Рівень 3', 'Завершено курс VLAN та Switching', 'check-circle', '{"type": "course_completed", "level": 3}'::jsonb, 400),
('Рівень 4', 'Завершено курс VPN', 'check-circle', '{"type": "course_completed", "level": 4}'::jsonb, 500),
('Рівень 5', 'Завершено курс Security', 'check-circle', '{"type": "course_completed", "level": 5}'::jsonb, 600),
('Рівень 6', 'Завершено курс Enterprise', 'check-circle', '{"type": "course_completed", "level": 6}'::jsonb, 700),
('MTCNA Ready', 'Готовий до сертифікації MTCNA', 'award', '{"type": "all_courses_completed"}'::jsonb, 1000);