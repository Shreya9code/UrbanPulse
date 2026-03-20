# models/traffic_model.py
import torch
import torch.nn as nn
import torch_geometric.nn as pyg_nn

class GCN_LSTM_Attn(nn.Module):
    def __init__(self, num_nodes, in_channels, hidden_dim):
        super().__init__()

        # GCN layers (SPATIAL)
        self.gcn1 = pyg_nn.GCNConv(in_channels, hidden_dim)
        self.gcn2 = pyg_nn.GCNConv(hidden_dim, hidden_dim)

        # LSTM (TEMPORAL)
        self.lstm = nn.LSTM(hidden_dim, hidden_dim, batch_first=True)

        # Attention
        self.attn = nn.Linear(hidden_dim, 1)

        # Final output
        self.fc = nn.Linear(hidden_dim, 1)

        self.num_nodes = num_nodes
        self.hidden_dim = hidden_dim

    def forward(self, x, edge_index):
        # x shape: (B, T, N, 1)
        B, T, N, F = x.shape
        
        # Process each timestep with GCN
        gcn_outputs = []
        for t in range(T):
            xt = x[:, t, :, :]  # (B, N, 1)
            
            # Apply GCN to each batch item
            batch_gcn = []
            for b in range(B):
                h = self.gcn1(xt[b], edge_index)
                h = torch.relu(h)
                h = self.gcn2(h, edge_index)
                batch_gcn.append(h)
            
            gcn_outputs.append(torch.stack(batch_gcn))
        
        gcn_outputs = torch.stack(gcn_outputs, dim=1)  # (B, T, N, hidden)

        # Reshape for LSTM → treat each node as sequence over time
        gcn_outputs = gcn_outputs.permute(0, 2, 1, 3)  # (B, N, T, hidden)
        gcn_outputs = gcn_outputs.reshape(B * N, T, self.hidden_dim)

        # LSTM
        lstm_out, _ = self.lstm(gcn_outputs)  # (B*N, T, hidden)

        # Attention
        attn_scores = self.attn(lstm_out)  # (B*N, T, 1)
        attn_weights = torch.softmax(attn_scores, dim=1)
        context = (attn_weights * lstm_out).sum(dim=1)  # (B*N, hidden)

        # Final prediction
        out = self.fc(context)  # (B*N, 1)
        out = out.view(B, N)    # (B, Nodes)

        return out