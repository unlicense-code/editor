// sudo mount -t tmpfs -o size=200M none /tmp/ramdisk

// # Persistent setup
// mkdir -p /media/ramdisk
// sudo chmod 777 /media/ramdisk 
// echo "tmpfs    /media/ramdisk    tmpfs    defaults,size=20%      0       0" >> /etc/fstab
// sudo mount tmpfs 