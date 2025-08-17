import React from 'react';
import { Button, Icon } from '../atoms';
import { ConfigOption } from '../../types';

interface ConfigMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  options: ConfigOption[];
}

export const ConfigMenu: React.FC<ConfigMenuProps> = ({
  isOpen,
  onToggle,
  options
}) => {
  return (
    <div className="config-menu-container" style={{ position: 'relative' }}>
      <Button 
        variant="navbar"
        title="Opciones"
        onClick={onToggle}
      >
        <Icon name="gear" />
      </Button>

      {isOpen && (
        <div className="config-dropdown">
          <div className="config-dropdown-header">
            <Icon name="gear-fill" className="me-2" />
            Opciones
          </div>
          
          {options.map((option) => (
            <div 
              key={option.id}
              className={`config-dropdown-item ${option.disabled ? 'config-item-disabled' : ''}`}
              onClick={option.disabled ? undefined : option.action}
            >
              <div className="config-item-icon">
                <Icon name={option.icon} />
              </div>
              <div className="config-item-content">
                <div className="config-item-title">
                  {option.title}
                </div>
                <div className="config-item-desc">
                  {option.description}
                </div>
              </div>
              <div className="config-item-status">
                {option.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
