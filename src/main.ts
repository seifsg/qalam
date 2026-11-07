// App entry: finds the mount point once; views render into it.
const root = document.getElementById('app')
if (!root) throw new Error('Qalam: #app mount point missing from index.html')

root.textContent = 'Qalam قلم'
