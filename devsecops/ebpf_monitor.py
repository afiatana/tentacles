#!/usr/bin/env python3
"""
eBPF-based Runtime Security Profiler for Tentacles Sysbox Containers.
Requires bcc (BPF Compiler Collection) and python3-bcc packages on the Host Kernel OS.
Do NOT run this inside the container; this operates on the Host OS to profile container syscalls.
"""

from bcc import BPF
import time

# eBPF C program snippet: Hook into the execve syscall
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 tgid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    char fname[256];
};

BPF_PERF_OUTPUT(events);

// Hook start of execve
int syscall__execve(struct pt_regs *ctx, const char __user *filename) {
    struct data_t data = {};
    
    // Grab process identifier structure
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.tgid = bpf_get_current_pid_tgid();
    data.uid = bpf_get_current_uid_gid();
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // Read the filename being executed
    bpf_probe_read_user_str(&data.fname, sizeof(data.fname), filename);
    
    // In production, we would filter based on container pids (cgroups). 
    // Here we catch execve anomalies that might specify payload dropping.
    
    events.perf_submit(ctx, &data, sizeof(data));
    return 0;
}
"""

print("[+] Initializing Tentacles eBPF Runtime Security Monitor on Host OS.")
try:
    # Compile the eBPF program
    b = BPF(text=bpf_text)
    # Attach kprobe to the system call
    execve_fnname = b.get_syscall_fnname("execve")
    b.attach_kprobe(event=execve_fnname, fn_name="syscall__execve")
    
    print("[+] Successfully clamped eBPF hooks onto sys_execve.")
    print(f"{'PID':<7} {'UID':<7} {'COMM':<16} {'FILENAME (Syscall execution detected)'}")
    
    # Define event printing logic
    def print_event(cpu, data, size):
        event = b["events"].event(data)
        # Displaying the event. Production clusters would ship this UDP payload to SIEM.
        print(f"{event.pid:<7} {event.uid:<7} {event.comm.decode('utf-8', 'replace'):<16} {event.fname.decode('utf-8', 'replace')}")

    # Read events loop
    b["events"].open_perf_buffer(print_event)
    while True:
        try:
            b.perf_buffer_poll()
        except KeyboardInterrupt:
            print("\\n[!] Halting eBPF Monitor.")
            exit()
            
except Exception as e:
    print(f"[!] eBPF Initialization failed. Are you running as root on a Linux kernel? Error: {e}")
    print("[i] (Dev Note: Remember, this script is for the Linux Host OS, not Windows/Mac local).")
