export type Task = {
    id: number;
    hardness: number;
};

export type Tasks = Set<Task>;

export type AssignedTasks = Map<number, {
    task: Task;
    status: '' | 'assigning' | 'processing' | 'done';
}>;

export type VirtualMachineReference = {
    id: string;
    lastMessage: number;
    lastPing: number;
    power: number;
    setPower: (power: number) => void;
};

export type VirtualMachinesReference = Set<VirtualMachineReference>;

export type Combination = {
    task: Task;
    vmId: VirtualMachineReference['id'];
    vmPower: VirtualMachineReference['power'];
};

export type CandidateSchedule = {
    combination: Array<Combination>;
    createCombination: (tasks: Array<Task>) => void;
    estimatedTime: number;
};
