import CONFIG from '../config';

interface VaultSelectorProps {
  selectedVault: string;
  onVaultChange: (vaultId: string) => void;
}

export default function VaultSelector({ selectedVault, onVaultChange }: VaultSelectorProps) {
  const vaults = CONFIG.vaultMetadata;

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Vault</h2>
        <p className="text-gray-400">
          Select a vault based on your risk tolerance and yield expectations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(vaults).map(([key, vault]) => (
          <button
            key={key}
            onClick={() => onVaultChange(key)}
            className={`
              relative overflow-hidden rounded-xl border-2 transition-all duration-300
              ${selectedVault === key 
                ? 'border-bitcoin-orange shadow-lg shadow-bitcoin-orange/20 scale-105' 
                : 'border-dark-border hover:border-gray-600'
              }
            `}
          >
            <div className={`
              absolute inset-0 bg-gradient-to-br ${vault.gradient} opacity-10
              ${selectedVault === key ? 'opacity-20' : ''}
            `} />
            
            <div className="relative p-6">
              {/* Icon & Selected Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{vault.icon}</div>
                {selectedVault === key && (
                  <div className="badge badge-success text-xs">
                    Selected
                  </div>
                )}
              </div>

              {/* Vault Name & Symbol */}
              <h3 className="text-xl font-bold mb-1">{vault.name}</h3>
              <div className="text-xs text-gray-500 mb-3">{vault.symbol}</div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-4 min-h-[40px]">
                {vault.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-dark-card/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Target APY</div>
                  <div className={`
                    text-lg font-bold
                    ${vault.riskLevel === 'high' ? 'text-purple-400' : 
                      vault.riskLevel === 'medium' ? 'text-bitcoin-orange' : 
                      'text-success'}
                  `}>
                    {vault.targetAPY}
                  </div>
                </div>

                <div className="bg-dark-card/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`
                          w-1.5 h-4 rounded-full
                          ${i < vault.riskScore 
                            ? vault.riskLevel === 'high' ? 'bg-purple-500' :
                              vault.riskLevel === 'medium' ? 'bg-bitcoin-orange' :
                              'bg-success'
                            : 'bg-gray-700'
                          }
                        `}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Strategy Focus */}
              <div className="text-xs text-gray-500 bg-dark-card/30 rounded-lg p-2 mb-3">
                <span className="font-semibold">Focus:</span> {vault.strategyFocus}
              </div>

              {/* Fee Display */}
              <div className="text-xs text-gray-500">
                Performance Fee: <span className="text-gray-400 font-medium">{vault.performanceFee}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Vault Comparison Table */}
      <div className="mt-8 card">
        <h4 className="font-bold mb-4 text-center">Vault Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-2">Feature</th>
                <th className="text-center py-3 px-2">Conservative</th>
                <th className="text-center py-3 px-2">Balanced</th>
                <th className="text-center py-3 px-2">Growth</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-dark-border/50">
                <td className="py-3 px-2">Target APY</td>
                <td className="text-center text-success">8-10%</td>
                <td className="text-center text-bitcoin-orange">12-16%</td>
                <td className="text-center text-purple-400">18-25%</td>
              </tr>
              <tr className="border-b border-dark-border/50">
                <td className="py-3 px-2">Risk Level</td>
                <td className="text-center">Low (2/5)</td>
                <td className="text-center">Medium (3/5)</td>
                <td className="text-center">High (4/5)</td>
              </tr>
              <tr className="border-b border-dark-border/50">
                <td className="py-3 px-2">Best For</td>
                <td className="text-center text-xs">Capital preservation</td>
                <td className="text-center text-xs">Balanced growth</td>
                <td className="text-center text-xs">Maximum returns</td>
              </tr>
              <tr>
                <td className="py-3 px-2">Performance Fee</td>
                <td className="text-center">8%</td>
                <td className="text-center">8%</td>
                <td className="text-center">8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
