#!/usr/bin/env python3
"""
PAM 认证辅助脚本 — 使用 ctypes + libc malloc 调用 libpam
用法: echo "username\npassword" | python3 pam_helper.py
返回: JSON { "success": true } 或 { "success": false, "error": "..." }
"""

import sys
import json
import ctypes
import ctypes.util

PAM_SUCCESS = 0
PAM_SERVICE = "login"

# ── 加载 libc（用于 malloc/free 兼容 PAM 内存管理） ──
libc = ctypes.CDLL(ctypes.util.find_library("c"))
libc.malloc.restype = ctypes.c_void_p
libc.malloc.argtypes = [ctypes.c_size_t]
libc.strdup.restype = ctypes.c_void_p
libc.strdup.argtypes = [ctypes.c_char_p]


class PamMessage(ctypes.Structure):
    _fields_ = [
        ("msg_style", ctypes.c_int),
        ("msg", ctypes.c_char_p),
    ]


class PamResponse(ctypes.Structure):
    _fields_ = [
        ("resp", ctypes.c_char_p),
        ("resp_retcode", ctypes.c_int),
    ]


PAM_CONV_FUNC = ctypes.CFUNCTYPE(
    ctypes.c_int,
    ctypes.c_int,
    ctypes.POINTER(ctypes.POINTER(PamMessage)),
    ctypes.POINTER(ctypes.POINTER(PamResponse)),
    ctypes.c_void_p,
)


class PamConv(ctypes.Structure):
    _fields_ = [
        ("conv", PAM_CONV_FUNC),
        ("appdata_ptr", ctypes.c_void_p),
    ]


def pam_conv_callback(num_msg, msg_ptr, resp_ptr, appdata_ptr):
    """PAM 对话回调 — 返回密码（使用 libc malloc 确保内存兼容）"""
    password = ctypes.cast(appdata_ptr, ctypes.c_char_p).value
    if password is None:
        return 1

    # 用 libc malloc 分配响应数组（PAM 会用 free() 释放）
    resp_size = ctypes.sizeof(PamResponse) * num_msg
    raw = libc.malloc(resp_size)
    responses = ctypes.cast(raw, ctypes.POINTER(PamResponse))

    for i in range(num_msg):
        # 用 libc strdup 分配密码字符串（PAM 不释放这些，但以防万一）
        responses[i].resp = ctypes.cast(libc.strdup(password), ctypes.c_char_p)
        responses[i].resp_retcode = 0

    resp_ptr[0] = responses
    return PAM_SUCCESS


def authenticate(username, password):
    """使用 libpam 验证用户名和密码"""
    lib_name = ctypes.util.find_library("pam")
    if not lib_name:
        return {"success": False, "error": "无法找到 libpam 库"}

    libpam = ctypes.CDLL(lib_name)

    libpam.pam_start.restype = ctypes.c_int
    libpam.pam_start.argtypes = [
        ctypes.c_char_p, ctypes.c_char_p,
        ctypes.POINTER(PamConv),
        ctypes.POINTER(ctypes.c_void_p),
    ]
    libpam.pam_authenticate.restype = ctypes.c_int
    libpam.pam_authenticate.argtypes = [ctypes.c_void_p, ctypes.c_int]
    libpam.pam_end.restype = ctypes.c_int
    libpam.pam_end.argtypes = [ctypes.c_void_p, ctypes.c_int]
    libpam.pam_strerror.restype = ctypes.c_char_p
    libpam.pam_strerror.argtypes = [ctypes.c_void_p, ctypes.c_int]

    conv_func = PAM_CONV_FUNC(pam_conv_callback)
    password_bytes = password.encode("utf-8")

    conv = PamConv()
    conv.conv = conv_func
    conv.appdata_ptr = ctypes.cast(
        ctypes.c_char_p(password_bytes), ctypes.c_void_p
    )

    pamh = ctypes.c_void_p()
    service = PAM_SERVICE.encode("utf-8")
    user = username.encode("utf-8")

    status = libpam.pam_start(service, user, ctypes.byref(conv), ctypes.byref(pamh))
    if status != PAM_SUCCESS:
        msg = libpam.pam_strerror(pamh, status) if pamh else b"PAM start failed"
        return {"success": False, "error": msg.decode("utf-8", errors="replace")}

    try:
        status = libpam.pam_authenticate(pamh, 0)
        if status == PAM_SUCCESS:
            return {"success": True}
        else:
            err_msg = libpam.pam_strerror(pamh, status)
            msg = err_msg.decode("utf-8", errors="replace") if err_msg else "Authentication failed"
            return {"success": False, "error": msg}
    finally:
        libpam.pam_end(pamh, status)


if __name__ == "__main__":
    input_data = sys.stdin.read().strip()
    parts = input_data.split("\n", 1)
    if len(parts) < 2:
        print(json.dumps({"success": False, "error": "需要 username 和 password"}))
        sys.exit(1)

    username = parts[0]
    password = parts[1]
    result = authenticate(username, password)
    print(json.dumps(result))
