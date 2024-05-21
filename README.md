# lower scheduling overhead
 
## How to run?

- Install Node.js (tested on v20.5.0 and v20.11.0)
- Install package dependencies (`npm i`)
- Environment configuration (copy `.env.example` and rename to `.env`)
- Use `run.cmd` (Windows only) or manually run 1 leader (`./src/leader.js`) and desired number of VMs (`./src/virtualMachine.js`, default count is 5)

## Draw charts

`node ./src/common/drawGraph.js`

---

## Result

### Config
VM count: **5**  
VM MIPS range: **250-1000**  
Configure task count: **300**  
Configure schedule count: **50**  
Speed rate: **50**  


Tasks | Estimated | Elapsed
----- | --------- | -----
50 | 176ms | 527ms
250 | 1,748ms | 1,870ms
500 | 3,424ms | 3,860ms
800 | 5,197ms | 5,532ms
1500 | 9,333ms | 11,166ms
3000 | 18,196ms | 21,906ms
