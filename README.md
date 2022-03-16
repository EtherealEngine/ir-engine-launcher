![xrengine black](https://user-images.githubusercontent.com/5104160/142821267-7e131891-0caa-496b-9cda-a82dee8a04b6.png)


**Your own sandbox in the Metaverse. Take what you need, or launch the full stack. 
XREngine Control Center is a desktop app for managing XREngine cluster.**

https://github.com/XRFoundation/XREngine/issues/3206
Electron based XR Engine Server Cluster Creator app

Ability to fully manage an on premises server.

Electron K8S Cluster Creator and Manager App

Easy setup and install deps (microk8s / minikube, docker etc) https://microk8s.io/ 1
Wrap all K8S CLI into a GUI 2
Benchmark tool - detect min PC specs Probably has a min of 4 CPU cores and 16-24GB of ram. 1
Electron app with client for access to admin panel, supply link to open location in browser 2
Multiple electron apps with same k8s control plane 1

We [XR Foundation](https://github.com/xrfoundation) believe that the Metaverse, Web AR, VR. XR should be easy.


## Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/xrfoundation/xrengine-control-center.git your-project-name
cd your-project-name
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




# ROADMAP

## V1
Install terminal screen - might require root prompt

Reinstall / Fail / uninstall?

Might be some sort of default user or user setup process for making an admin.

Electron runs the k8 setup we already have
https://github.com/rannn505/child-shell
formally https://rannn505.github.io/node-powershell/

Electron server app UI : Add a built in dashboard to our setup and the admin panel
Maybe a landing page linking to the client, admin dashbord, k8 dashbord, and logs.

https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/
Kubernetes - Deploy the web UI (Kubernetes Dashboard) and access it.

https://www.electronjs.org/docs/api/shell shell | Electron - Manage files and URLs using their default applications.

https://github.com/jorangreef/sudo-prompt
Run a command using sudo, prompting the user with an OS dialog if necessary.

## V2
Add dynamic DNS support - https://www.dynu.com/
https://en.wikipedia.org/wiki/Dynamic_DNS

## V3
Make webxr client for steamvr
https://bai.dev/projects/webxr-electron-apr2021.html

## V4
Add dev mode

Add content packs (reality packs) to bundles.

## V5
add IPFS, BCIAB, P2P / SFU Chaining, Dynamic DNS to domain names, LifeScope

## Let's build it together
We believe that projects like this are extremely complex and difficult, and can only be built when large groups of people work together, out in the open. If you believe that your calling is to build a free, open network that everyone, everywhere can get value from, then you are welcome in our community, and we'll do our best to get you set up.

We are always hiring talented people who want to be leaders in what is to come. Inquire with anyone who seems like they know what's going on and they'll help you find who you need to talk to.

### [Join our Discord](https://discord.gg/xrf)  [![Discord Chat](https://img.shields.io/discord/692672143053422678.svg)](https://discord.gg/xrf)

### [Sponsorship](https://opencollective.com/xrfoundation) [![Open Collective](https://opencollective.com/xrfoundation/tiers/badge.svg)](https://opencollective.com/xrfoundation)
