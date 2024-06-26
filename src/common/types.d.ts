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
};

export type VirtualMachinesReference = Set<VirtualMachineReference>;

export type Combination = {
    task: Task;
    vmId: VirtualMachineReference['id'];
    vmPower: number;
};

export type CandidateSchedule = {
    combination: Array<Combination>;
    vmPowerMap: Map<VirtualMachineReference['id'], number>;
    createCombination: (tasks: Array<Task>) => void;
    time: number;
    id: number;
};

export type ScheduleRegression = {
    origin: CandidateSchedule;
    regressionCalculator: (x: number) => number;
}
