# Ethereal Engine Control Center

Want to build the spatial web on your website? Looking for a place to start? Run a web metaverse cluster yourself on your own computer.

**The Ethereal Engine Control Center is a self-contained Metaverse world in a box.** 
Take what you need or launch the full stack.  Ethereal Engine Control Center is a desktop app to manage a metaverse cluster.

We know it's been complicated to build with #EtherealEngine and we've made this tool to give the community easy access to the engine for development and creation. The full Kubernetes cluster can run on Windows and any Debian Linux distro with at least 16 GB of ram.

We would love to see your creations and invite you all to come build with us. We've got a long backlog and need your help to build the Open Metaverse. Come build with us!

### [DOWNLOAD HERE](https://github.com/etherealengine/etherealengine-control-center/releases)

https://user-images.githubusercontent.com/10975502/168554732-86a202b6-053c-4588-8153-cd2c9c2771d5.mp4

### [DOWNLOAD HERE](https://github.com/etherealengine/etherealengine-control-center/releases)

### [All Control Center Video Tutorials](./TUTORIALS.md)

## Install Released

[Download latest version of Ethereal Engine control center app from here](https://github.com/etherealengine/etherealengine-control-center/releases).

1. (Windows) Directly download the .exe file.
2. (Linux) For AppImage: Once downloaded, right click and go to **Properties**. In **Permissions** tab check 'Allow executing file as program'.
Then, double click on AppImage to launch the app.

> Note: Currently the app is tested on Windows 11 and Ubuntu 20.04 & 22.04.

## Troubleshooting

### 1. App not launching in Ubuntu 22.04

Install [Fuse](https://docs.appimage.org/user-guide/troubleshooting/fuse.html):

```bash
sudo apt-get install fuse libfuse2 -y
```

### 2. Windows permission to run ps1 scripts

On Windows, if you get following error in logs:

```bash
.ps1 cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
```

You need to allow running unsigned powershell scripts on your machine. You follow below steps to do so:

1. Open Powershell as administrator.
2. Run following command to find out your current execution policy.

```bash
Get-ExecutionPolicy
```

3. Run following command to set the execution policy to allow unsigned scripts.

```bash
Set-ExecutionPolicy -ExecutionPolicy Unrestricted
```

You can read more on [powershell execution policy](https:/go.microsoft.com/fwlink/?LinkID=135170).

### 3. Snap & MicroK8s k8s commands showing 'incorrect number of tail fields' error in Windows WSL

On Windows, if you get error in logs like below:

```bash
system_key.go:129: cannot determine nfs usage in generateSystemKey: cannot parse mountinfo: incorrect number of tail fields, expected 3 but found 4
cmd_run.go:1046: WARNING: cannot create user data directory: cannot determine SELinux status: failed to obtain SELinux mount path: incorrect number of tail fields, expected 3 but found 4
```

This is due to Docker Desktop default installation location issue. You can read more on [Microk8s Issue #3911](https://github.com/canonical/microk8s/issues/3911) & [Docker Issue #13318](https://github.com/docker/for-win/issues/13318).

This issue is mainly due to Docker Desktop being installed in default location. Here are the steps you can follow to fix this:

1. Uninstall existing installation of Docker Desktop in Windows.
2. Download latest version of [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
3. Open Command Prompt.
4. Change current working directory to downloaded Docker Desktop folder. i.e.

```bash
cd "C:\Users\%USERNAME%\Downloads"
```

5. Run following command to install Docker Desktop in folder other than default one.

```bash
"Docker Desktop Installer.exe" install --accept-license --installation-dir=C:\Docker
```

### 4. Reporting an Issue

If you face an issue please report it to [Issues](https://github.com/canonical/microk8s/issues) or reach out to us on [Discord](https://discord.gg/xrf). Also please share following log files:

1. Non-UI logs found at following path:
  
    - on Linux: `~/.config/etherealengine-control-center/logs/main.log`
    - on macOS: `~/Library/Logs/etherealengine-control-center/main.log`
    - on Windows: `%USERPROFILE%\AppData\Roaming\etherealengine-control-center\logs\main.log`

2. UI logs found using download button in app as shown in below image.
![LogsDownload](https://user-images.githubusercontent.com/10975502/219317443-5cdf19fd-1e60-4907-a124-56cec72bb633.jpg)

## Install Development Release

Clone this repository:
```bash
git clone https://github.com/etherealengine/etherealengine-control-center.git ethereal-control-center
```
Go inside the folder:
```bash
cd ethereal-control-center
```
Install the dependencies:
```bash
npm install
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm run dev
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Let's build it together

We believe that projects like this are extremely complex and difficult, and can only be built when large groups of people work together, out in the open. If you believe that your calling is to build a free, open network that everyone, everywhere can get value from, then you are welcome in our community, and we'll do our best to get you set up.

We are always hiring talented people who want to be leaders in what is to come. Inquire with anyone who seems like they know what's going on and they'll help you find who you need to talk to.

### [Join our Discord](https://discord.gg/xrf)  [![Discord Chat](https://img.shields.io/discord/692672143053422678.svg)](https://discord.gg/xrf)

**Your own sandbox in the Metaverse. Take what you need, or launch the full stack.
Ethereal Engine Control Center is a desktop app for managing Ethereal Engine cluster.**

Electron based Ethereal Engine Server Cluster Creator app

- Ability to fully manage an on premises server.
- Electron K8S Cluster Creator and Manager App
- Easy setup and install deps (microk8s / minikube, docker etc) <https://microk8s.io/>
- Wrap all K8S CLI into a GUI
- Electron app with client for access to admin panel, supply link to open location in browser
- Multiple electron apps with same k8s control plane
- Benchmark tool - minimum specs of 4 CPU cores and 16-24GB of ram.

We [Ethereal Engine](https://github.com/etherealengine) believe that the Metaverse, Web AR, VR. XR should be easy.

### [Sponsorship](https://opencollective.com/etherealengine) [![Open Collective](https://opencollective.com/etherealengine/tiers/badge.svg)](https://opencollective.com/etherealengine)
