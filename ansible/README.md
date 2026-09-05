# Hướng dẫn Quản lý Nginx Domain & SSL bằng Ansible (SwifletHome)

Hệ thống Ansible này giúp tự động hóa việc đồng bộ, đăng ký SSL Let's Encrypt và kích hoạt các file cấu hình Nginx domain từ thư mục `local/nginx/` lên server `103.77.160.68`.

---

## Cấu trúc Thư mục

```text
ansible/
├── ansible.cfg                    # File cấu hình Ansible mặc định
├── inventory/
│   ├── hosts.ini                  # Khai báo thông tin Server (IP, SSH User/Password)
│   └── group_vars/
│       └── webservers.yml         # Khai báo biến domain, bật SSL, email Certbot
├── site.yml                       # Playbook chính để chạy
├── README.md                      # Hướng dẫn chi tiết
└── roles/
    └── nginx_domains/
        ├── tasks/main.yml         # Copy conf, tạo symlink, tự động cài Certbot & cấp SSL
        ├── handlers/main.yml      # Handler kiêm tra syntax (nginx -t) & reload Nginx
        └── templates/
            └── domain.conf.j2     # Template mẫu cho domain mới (tự động tích hợp SSL)
```

---

## Cấu hình SSL Tự động trong Ansible

1. Trong file `ansible/inventory/group_vars/webservers.yml`, mỗi domain có thuộc tính:
   ```yaml
   certbot_email: "admin@3fam.ai"

   nginx_domains:
     - name: jenkins.3fam.ai
       server_name: "jenkins.3fam.ai"
       upstream_url: "http://127.0.0.1:8080"
       websocket: true
       enable_ssl: true  # <--- Tự động cài Certbot & cấp chứng chỉ SSL
   ```
2. Ansible sẽ tự động kiểm tra chứng chỉ tại `/etc/letsencrypt/live/<domain>/fullchain.pem`. Nếu chưa có, Ansible sẽ tự chạy `certbot --nginx` để đăng ký SSL cho domain đó.
3. Trong file template `domain.conf.j2` cũng đã bao gồm khối lệnh SSL:
   ```nginx
   listen 443 ssl;
   ssl_certificate /etc/letsencrypt/live/{{ item.name }}/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/{{ item.name }}/privkey.pem;
   ```

---

## Cách Thêm Domain Mới Trong Tương Lai

### Cách 1: Khai báo vào `ansible/inventory/group_vars/webservers.yml` (Khuyên dùng)
Thêm domain mới vào danh sách `nginx_domains`:
```yaml
  - name: api.3fam.ai
    server_name: "api.3fam.ai"
    upstream_url: "http://127.0.0.1:4000"
    enable_ssl: true
```
Khi chạy Ansible, hệ thống sẽ **tự sinh file conf + tự đăng ký SSL với Certbot + kích hoạt Nginx**.

### Cách 2: Thêm file `.conf` thủ công vào `local/nginx/`
Tạo file `local/nginx/api.3fam.ai.conf` và chạy lệnh Ansible. Ansible sẽ sync file này lên server và tự động xin SSL qua Certbot.

---

## Lệnh Chạy Ansible

```bash
cd ansible
ansible-playbook -i inventory/hosts.ini site.yml
```
