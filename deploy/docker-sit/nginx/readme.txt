为什么 AS 需要直接转发到 cloud-oauth-server 而不能通过 cloud-gateway 访问?
    因为 cloud-gateway 中有包含 RS 需要的权限校验，且默认会给 HTTP request header 塞一个
    Authorization: Bearer {{anonymous-token}}
    从而导致 AS 认为当前 session 已经登录，而报错
