<script lang="ts">
    import type { instance } from "$lib/gitStruct";

	export let instances:instance[]
</script>

<div class='debug'>
	{#key instances}<ul>
{#each instances as instance}
	<li><span class:showTrue={instance.show === true} class:showFalse={instance.show === false} class:showNull={instance.show === null}>{instance.label}</span><ul>
			{#each instance.royaumes as royaume}
			<li><span class:showTrue={royaume.show === true} class:showFalse={royaume.show === false} class:showNull={royaume.show === null}>{royaume.label}</span><ul>
					{#if royaume.clientIds}{#each royaume.clientIds as clientId}
					<li><span class:showTrue={clientId.show === true} class:showFalse={clientId.show === false} class:showNull={clientId.show === null}>{clientId.label}</span><ul>
							{#each clientId.envs as env}
							<li><span class:showTrue={env.show === true} class:showFalse={env.show === false} class:showNull={env.show === null}>{env.label}</span><ul>
									{#if env.uris}
										{#each env.uris as uri}
											<li>{uri}</li>
										{/each}
									{/if}
							</ul></li>
							{/each}
					</ul></li>
					{/each}{/if}
			</ul></li>
			{/each}
		</ul></li>
{/each}</ul>
{/key}
</div>

<style>
	.debug{
		font-size: 0.7em;
	}
	.showTrue {
		color:green
	}

	.showFalse {
		color:red
	}

	.showNull {
		color:gray
	}
</style>
