import { FF, SetupFeatureServices, RegistryList } from '@triviality/core';
import { Command } from 'commander';
import { CommanderConfigurationInterface } from './CommanderConfigurationInterface';
import { CommanderBootstrapService } from './CommanderBootstrapService';
import { LoggerFeatureServices } from '@triviality/logger';

export interface CommanderFeatureServices {
  commanderBootstrapService: CommanderBootstrapService;
  commanderConfigurations: RegistryList<CommanderConfigurationInterface>;
  commanderService: Command;
}

export const CommanderFeature: FF<CommanderFeatureServices, LoggerFeatureServices & SetupFeatureServices> =
  ({ registerList, construct }) => ({
    commanderConfigurations: registerList<CommanderConfigurationInterface>(),
    commanderService: construct(Command),
    commanderBootstrapService: construct(CommanderBootstrapService, 'commanderService', 'commanderConfigurations', 'logger'),
  });
